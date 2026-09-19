import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import studentsSeed from '../../data/students.json';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('codelift_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync auth state to localStorage
  const saveAuth = (authData) => {
    setAuth(authData);
    try {
      if (authData) {
        localStorage.setItem('codelift_auth', JSON.stringify(authData));
      } else {
        localStorage.removeItem('codelift_auth');
      }
    } catch (_) {}
  };

  // Hydrate auth profile for a given user session
  async function hydrateProfile(user) {
    if (!user) {
      saveAuth(null);
      return;
    }

    try {
      // Check if user is admin in users table
      const { data: adminUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (adminUser && adminUser.role === 'admin') {
        saveAuth({
          role: 'admin',
          userId: user.id,
          id: user.id,
          name: adminUser.name || 'Administrator',
          username: adminUser.username || '',
          email: user.email || adminUser.email,
          phone: adminUser.phone || ''
        });
        return;
      }

      // Check if student in students table
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .or(`id.eq.${user.id},email.eq.${user.email}`)
        .single();

      if (student) {
        let customPassword = null;
        try {
          const emailKey = (student.email || user.email || '').toLowerCase().trim();
          customPassword =
            (student.id && localStorage.getItem(`codelift_student_pwd_${student.id}`)) ||
            (student.legacy_id && localStorage.getItem(`codelift_student_pwd_${student.legacy_id}`)) ||
            (user.id && localStorage.getItem(`codelift_student_pwd_${user.id}`)) ||
            (emailKey && localStorage.getItem(`codelift_student_pwd_${emailKey}`)) ||
            null;
          if (!customPassword) {
            const regRaw = localStorage.getItem('codelift_student_passwords');
            if (regRaw) {
              const reg = JSON.parse(regRaw);
              customPassword = (student.id && reg[student.id]) || (student.legacy_id && reg[student.legacy_id]) || (emailKey && reg[emailKey]) || null;
            }
          }
        } catch (_) {}

        const resolvedPassword = customPassword || student.password || auth?.password || 'codelift123';

        saveAuth({
          role: 'student',
          userId: student.id,
          studentId: student.id,
          id: student.id,
          studentName: student.name,
          name: student.name,
          email: student.email || user.email,
          phone: student.phone || '',
          batchId: student.batch_id || '',
          progress: student.progress || {},
          password: resolvedPassword
        });
        return;
      }

      // Default authenticated fallback
      saveAuth({
        role: user.user_metadata?.role || 'student',
        userId: user.id,
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.phone || ''
      });
    } catch (err) {
      console.warn('[AuthContext] Profile hydration note:', err.message);
      saveAuth({
        role: user.user_metadata?.role || 'student',
        userId: user.id,
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        email: user.email
      });
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!isSupabaseConfigured) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            await hydrateProfile(initialSession.user);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] getSession warning:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    let subscription;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        setSession(newSession);
        // Explicitly handle 1-hour JWT token expiration and background refreshes
        if (event === 'TOKEN_REFRESHED' || newSession?.user) {
          if (newSession?.user) {
            await hydrateProfile(newSession.user);
          }
        } else if (event === 'SIGNED_OUT') {
          saveAuth(null);
        }
      });
      subscription = data?.subscription;
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const loginAdmin = async (credentials) => {
    if (!isSupabaseConfigured) {
      // Offline / Local Demo Admin Login
      const u = credentials?.username?.trim()?.toLowerCase();
      const p = credentials?.password;
      const validDevPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD || 'admin';
      if (
        (u === 'admin' || u === 'admin@codelift.dev') &&
        (p === validDevPassword || p === 'admin' || p === 'demo')
      ) {
        const adminAuth = {
          role: 'admin',
          userId: 'admin',
          id: 'admin',
          name: 'Administrator',
          username: 'admin',
          email: 'admin@codelift.dev',
          phone: '+91 9876543210'
        };
        saveAuth(adminAuth);
        return adminAuth;
      }
      if (
        (u === 'rishabh' || u === 'codelift.official@gmail.com') &&
        (p === validDevPassword || p === 'admin' || p === 'demo')
      ) {
        const adminAuth = {
          role: 'admin',
          userId: 'a64e3fab-f4b6-4dfc-9064-581d7e536e98',
          id: 'a64e3fab-f4b6-4dfc-9064-581d7e536e98',
          name: 'Rishabh',
          username: 'rishabh',
          email: 'codelift.official@gmail.com',
          phone: '+91 9876543210'
        };
        saveAuth(adminAuth);
        return adminAuth;
      }
      throw new Error('Invalid administrator credentials.');
    }

    let email = credentials?.email;
    if (credentials?.username) {
      const { data: resolvedEmail, error: rpcErr } = await supabase.rpc('get_admin_email', {
        p_username: credentials.username.trim()
      });
      if (rpcErr || !resolvedEmail) {
        throw new Error('Invalid administrator credentials.');
      }
      email = resolvedEmail;
    }

    if (!email || !credentials?.password) {
      throw new Error('Please enter administrator username and password.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password
    });
    if (error) throw error;

    // Verify admin role in users table
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (adminErr || !adminUser || adminUser.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Unauthorized: Administrator privileges required.');
    }

    const adminAuth = {
      role: 'admin',
      userId: data.user.id,
      id: data.user.id,
      name: adminUser.name || 'Administrator',
      username: adminUser.username || credentials.username || 'admin',
      email: data.user.email || adminUser.email,
      phone: adminUser.phone || ''
    };
    saveAuth(adminAuth);
    return adminAuth;
  };

  const loginStudent = async (studentOrCreds) => {
    // Helper to get fallback students in offline or cached mode
    const getFallbackStudents = () => {
      try {
        const local = localStorage.getItem('codelift_students');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
      return Array.isArray(studentsSeed) ? studentsSeed : [];
    };

    if (!isSupabaseConfigured) {
      const email = (studentOrCreds?.email || '').trim().toLowerCase();
      const cached = getFallbackStudents();
      const matched = cached.find((s) => (s.email || '').toLowerCase() === email);

      if (matched) {
        if (matched.isActive === false || matched.status === 'SUSPENDED') {
          throw new Error('This student account is suspended or inactive. Please contact administration.');
        }

        const customPwd =
          (matched.id && localStorage.getItem(`codelift_student_pwd_${matched.id}`)) ||
          (matched.legacyId && localStorage.getItem(`codelift_student_pwd_${matched.legacyId}`)) ||
          localStorage.getItem(`codelift_student_pwd_${email}`) ||
          matched.password ||
          null;

        const hasCustomPwd = customPwd && customPwd !== 'codelift123' && customPwd !== 'password';

        if (hasCustomPwd) {
          if (studentOrCreds?.password !== customPwd) {
            throw new Error('Invalid student credentials. Please check your email and password.');
          }
        } else {
          const allowed = ['codelift123', 'password'];
          if (customPwd) allowed.push(customPwd);
          if (studentOrCreds?.password && !allowed.includes(studentOrCreds.password)) {
            throw new Error('Invalid student credentials. Default student password is "codelift123".');
          }
        }

        try {
          if (hasCustomPwd || (studentOrCreds.password && studentOrCreds.password !== 'codelift123' && studentOrCreds.password !== 'password')) {
            if (matched.id) localStorage.setItem(`codelift_student_pwd_${matched.id}`, studentOrCreds.password);
            if (matched.legacyId) localStorage.setItem(`codelift_student_pwd_${matched.legacyId}`, studentOrCreds.password);
            localStorage.setItem(`codelift_student_pwd_${email}`, studentOrCreds.password);
          }
        } catch (_) {}

        const next = {
          role: 'student',
          userId: matched.id,
          studentId: matched.id,
          id: matched.id,
          studentName: matched.name,
          name: matched.name,
          email: matched.email,
          phone: matched.phone || '',
          batchId: matched.batchId || '',
          progress: matched.progress || {},
          password: studentOrCreds?.password || customPwd || 'codelift123'
        };
        saveAuth(next);
        return next;
      }

      if (studentOrCreds?.password && studentOrCreds.password !== 'password' && studentOrCreds.password !== 'codelift123') {
        throw new Error('Invalid student credentials. Default student password is "codelift123".');
      }
      const next = {
        role: 'student',
        userId: 'stu-1',
        studentId: 'stu-1',
        id: 'stu-1',
        studentName: 'Rahul Sharma',
        name: 'Rahul Sharma',
        email: email || 'rahul.sharma@example.com',
        phone: '+91 9876543210',
        batchId: 'batch-fswd-morning',
        progress: { t1: true, t2: true, t3: true, t4: true },
        password: studentOrCreds?.password || 'codelift123'
      };
      saveAuth(next);
      return next;
    }

    if (studentOrCreds?.password && studentOrCreds?.email) {
      const email = studentOrCreds.email.trim();

      // Check if this email belongs to an administrator
      try {
        const { data: adminCheck } = await supabase
          .from('users')
          .select('role')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        if (adminCheck && adminCheck.role === 'admin') {
          throw new Error('Administrator accounts must log in via the administrator portal.');
        }
      } catch (adminErr) {
        if (adminErr.message?.includes('Administrator accounts')) throw adminErr;
      }

      // First attempt Supabase Auth sign in
      let authUser = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: studentOrCreds.password
        });
        if (!error && data?.user) {
          authUser = data.user;
        }
      } catch (authErr) {
        // Fallback to student record verification below
      }

      // Check student record in Supabase or local cache
      let student = null;
      try {
        const { data: stdRecord } = await supabase
          .from('students')
          .select('*')
          .or(authUser ? `id.eq.${authUser.id},email.eq.${email.toLowerCase()}` : `email.eq.${email.toLowerCase()}`)
          .maybeSingle();
        student = stdRecord;
      } catch (err) {
        // Supabase error, check local cache
      }

      if (!student) {
        const cached = getFallbackStudents();
        student = cached.find((s) => (s.email || '').toLowerCase() === email.toLowerCase());
      }

      // If Supabase auth succeeded
      if (authUser) {
        if (student && (student.is_active === false || student.isActive === false || student.status === 'SUSPENDED')) {
          await supabase.auth.signOut();
          throw new Error('This student account is suspended or inactive. Please contact administration.');
        }

        // Keep local password cache in sync
        try {
          localStorage.setItem(`codelift_student_pwd_${email.toLowerCase()}`, studentOrCreds.password);
          if (student?.id) {
            localStorage.setItem(`codelift_student_pwd_${student.id}`, studentOrCreds.password);
          }
          if (authUser.id) {
            localStorage.setItem(`codelift_student_pwd_${authUser.id}`, studentOrCreds.password);
          }
        } catch (_) {}

        const next = {
          role: 'student',
          userId: authUser.id,
          studentId: student?.id || authUser.id,
          studentName: student?.name || authUser.user_metadata?.name || 'Student',
          name: student?.name || authUser.user_metadata?.name || 'Student',
          email: authUser.email,
          phone: student?.phone || '',
          batchId: student?.batch_id || student?.batchId || '',
          progress: student?.progress || {},
          password: studentOrCreds.password
        };
        saveAuth(next);
        return next;
      }

      // If Supabase Auth failed (e.g. enrolled via admin, seed student, or local auth), check student record
      if (student) {
        if (student.is_active === false || student.isActive === false || student.status === 'SUSPENDED') {
          throw new Error('This student account is suspended or inactive. Please contact administration.');
        }

        const emailKey = (student.email || email).toLowerCase().trim();
        let customPassword = null;
        try {
          customPassword =
            (student.id && localStorage.getItem(`codelift_student_pwd_${student.id}`)) ||
            (student.legacy_id && localStorage.getItem(`codelift_student_pwd_${student.legacy_id}`)) ||
            (student.legacyId && localStorage.getItem(`codelift_student_pwd_${student.legacyId}`)) ||
            localStorage.getItem(`codelift_student_pwd_${emailKey}`) ||
            student.password ||
            null;
          if (!customPassword) {
            const regRaw = localStorage.getItem('codelift_student_passwords');
            if (regRaw) {
              const reg = JSON.parse(regRaw);
              customPassword = (student.id && reg[student.id]) || (student.legacy_id && reg[student.legacy_id]) || (student.legacyId && reg[student.legacyId]) || (emailKey && reg[emailKey]) || null;
            }
          }
        } catch (_) {}

        const hasCustomPassword =
          customPassword &&
          customPassword !== 'codelift123' &&
          customPassword !== 'password';
        const hasCustomSavedPwd = hasCustomPassword;

        if (hasCustomPassword) {
          // If a custom password has been set, ONLY the custom password is valid!
          if (studentOrCreds.password !== customPassword) {
            throw new Error('Invalid email or password. Please check your credentials or click Forgot Password.');
          }
        } else {
          // No custom password set yet: allow platform default passwords or existing customPassword
          const allowed = ['codelift123', 'password'];
          if (customPassword) allowed.push(customPassword);
          if (!allowed.includes(studentOrCreds.password)) {
            throw new Error('Invalid email or password. Please check your credentials or click Forgot Password.');
          }
        }

        // Cache valid password for seamless subsequent verification
        try {
          if (hasCustomPassword || (studentOrCreds.password !== 'codelift123' && studentOrCreds.password !== 'password')) {
            if (student.id) localStorage.setItem(`codelift_student_pwd_${student.id}`, studentOrCreds.password);
            if (student.legacy_id) localStorage.setItem(`codelift_student_pwd_${student.legacy_id}`, studentOrCreds.password);
            if (student.legacyId) localStorage.setItem(`codelift_student_pwd_${student.legacyId}`, studentOrCreds.password);
            localStorage.setItem(`codelift_student_pwd_${emailKey}`, studentOrCreds.password);
            const regRaw = localStorage.getItem('codelift_student_passwords');
            const reg = regRaw ? JSON.parse(regRaw) : {};
            reg[student.id] = studentOrCreds.password;
            reg[emailKey] = studentOrCreds.password;
            localStorage.setItem('codelift_student_passwords', JSON.stringify(reg));
          }
        } catch (_) {}

        const next = {
          role: 'student',
          userId: student.id,
          studentId: student.id,
          id: student.id,
          studentName: student.name || 'Student',
          name: student.name || 'Student',
          email: student.email || email,
          phone: student.phone || '',
          batchId: student.batch_id || student.batchId || '',
          progress: student.progress || {},
          password: studentOrCreds.password
        };
        saveAuth(next);
        return next;
      }

      throw new Error('Student account not found with this email. Please check your email or contact administration.');
    }

    if (!studentOrCreds || studentOrCreds.isActive === false || studentOrCreds.status === 'SUSPENDED') {
      throw new Error('This student account is suspended or inactive.');
    }

    const next = {
      role: 'student',
      userId: studentOrCreds.id,
      studentId: studentOrCreds.id,
      studentName: studentOrCreds.name,
      name: studentOrCreds.name,
      email: studentOrCreds.email || '',
      phone: studentOrCreds.phone || '',
      batchId: studentOrCreds.batchId || '',
      progress: studentOrCreds.progress || {}
    };
    saveAuth(next);
    return next;
  };

  const loginUser = (user) => {
    if (user.role === 'admin') loginAdmin();
    else loginStudent(user);
  };

  const updateAuthUser = (updates) => {
    setAuth((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        name: updates.name ?? prev.name,
        studentName: updates.name ?? prev.studentName,
        email: updates.email ?? prev.email,
        phone: updates.phone ?? prev.phone
      };
      try {
        localStorage.setItem('codelift_auth', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (_) {}
    try {
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith('codelift_student_progress_') ||
          key.startsWith('codelift_student_quizzes_') ||
          key.startsWith('codelift_last_topic_')
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (_) {}
    saveAuth(null);
    setSession(null);
  };

  const currentUser = auth
    ? {
        role: auth.role,
        id: auth.userId || auth.studentId || (auth.role === 'admin' ? 'admin' : 'student'),
        name: auth.name || (auth.role === 'admin' ? 'Administrator' : auth.studentName || 'User'),
        email: auth.email || (auth.role === 'admin' ? 'admin@codelift.dev' : ''),
        phone: auth.phone || ''
      }
    : null;

  const currentStudent = auth && auth.role === 'student'
    ? {
        id: auth.studentId || auth.userId || 'stu-1',
        name: auth.studentName || auth.name || 'Rahul Sharma',
        email: auth.email || 'rahul.sharma@example.com',
        phone: auth.phone || '',
        batchId: auth.batchId || 'batch-fswd-morning',
        progress: auth.progress || {},
        ...auth
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        auth,
        currentUser,
        user: currentUser,
        currentStudent,
        role: auth?.role || null,
        loading,
        loginAdmin,
        loginStudent,
        loginUser,
        loginAsAdmin: loginAdmin,
        loginAsStudent: (std) =>
          loginStudent(
            std || {
              id: 'stu-1',
              name: 'Rahul Sharma',
              email: 'rahul.sharma@example.com',
              batchId: 'batch-fswd-morning'
            }
          ),
        updateAuthUser,
        logout,
        isAdmin: auth?.role === 'admin',
        isStudent: auth?.role === 'student'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
