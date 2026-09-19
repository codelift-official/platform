/**
 * Fee Resolution Utility for CodeLift Courses & Cohorts
 * Ensures actual tuition fees configured in institutional Batches are fetched
 * and presented accurately across Home, Course Catalog, Course Details, and WhatsApp modals.
 */

/**
 * Resolves the true tuition fee of a course by cross-referencing attached Batches.
 *
 * @param {Object} course - The course object
 * @param {Array} batches - List of institutional batches
 * @returns {{ isFree: boolean, price: number, feeAmount: number, feeFormatted: string, originalPrice?: number, batchName?: string }}
 */
export function resolveCourseFee(course, batches = []) {
  if (!course) {
    return { isFree: true, price: 0, feeAmount: 0, feeFormatted: 'Free', originalPrice: null };
  }

  // 1. Direct course fee or price takes precedence for individual course / marketplace view
  const directPrice = Number(
    course.price !== undefined && course.price !== null
      ? course.price
      : (course.fee !== undefined && course.fee !== null ? course.fee : 0)
  );

  // If a direct price > 0 is configured, the course has that fee regardless of any legacy isFree flags
  if (directPrice > 0) {
    return {
      isFree: false,
      price: directPrice,
      feeAmount: directPrice,
      feeFormatted: `₹${directPrice.toLocaleString('en-IN')}`,
      originalPrice: course.originalPrice || Math.round(directPrice * 1.3)
    };
  }

  if (course.isFree || directPrice === 0) {
    return {
      isFree: true,
      price: 0,
      feeAmount: 0,
      feeFormatted: 'Free',
      originalPrice: null
    };
  }

  // 2. Query attached institutional batches if direct course price is not set
  const courseBatchIds = [
    ...(Array.isArray(course.batchIds) ? course.batchIds : []),
    ...(course.batchId ? [course.batchId] : [])
  ];

  const matchingBatch = (batches || []).find((b) => {
    if (courseBatchIds.length > 0 && courseBatchIds.includes(b.id)) {
      return true;
    }
    if (Array.isArray(b.courseIds)) {
      return b.courseIds.includes(course.id) || (course.slug && b.courseIds.includes(course.slug));
    }
    return false;
  });

  if (matchingBatch && typeof matchingBatch.feeAmount === 'number' && matchingBatch.feeAmount > 0) {
    const fee = matchingBatch.feeAmount;
    return {
      isFree: false,
      price: fee,
      feeAmount: fee,
      feeFormatted: `₹${fee.toLocaleString('en-IN')}`,
      originalPrice: course.originalPrice || Math.round(fee * 1.3),
      batchName: matchingBatch.name
    };
  }

  // 3. Default to Free if price is 0
  return {
    isFree: true,
    price: 0,
    feeAmount: 0,
    feeFormatted: 'Free',
    originalPrice: null
  };
}

/**
 * Resolves final tuition fee for a student in a cohort/batch.
 * As per architecture: Batch fee is the final fee for student view, regardless of sum of course fees.
 */
export function resolveStudentFinalFee(student, batch, courses = []) {
  if (batch && typeof batch.feeAmount === 'number') {
    return batch.feeAmount;
  }
  if (student && typeof student.totalFee === 'number') {
    return student.totalFee;
  }
  // Fallback to sum of batch courses
  if (batch && Array.isArray(batch.courseIds)) {
    return batch.courseIds.reduce((sum, cid) => {
      const c = courses.find((crs) => crs.id === cid);
      return sum + (c?.price || c?.fee || 0);
    }, 0);
  }
  return 0;
}
