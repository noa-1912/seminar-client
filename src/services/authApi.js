import authHttp from './authHttp';

const isDev = import.meta.env.DEV;
const roleToValue = {
  Student: 0,
  Admin: 1,
  Employer: 2,
};

function buildValidationMessage(errors) {
  if (!errors || typeof errors !== 'object') return '';
  const messages = Object.values(errors)
    .flatMap((item) => (Array.isArray(item) ? item : []))
    .filter(Boolean);
  return messages.join(' ');
}

function parseAxiosError(error, fallbackMessage) {
  let message = fallbackMessage;
  const payload = error?.response?.data;
  const validationMessage = buildValidationMessage(payload?.errors);
  if (validationMessage) {
    message = validationMessage;
  } else if (payload?.title) {
    message = payload.title;
  } else if (payload?.message) {
    message = payload.message;
  }

  if (isDev) {
    console.error('[auth][parsed-error]', {
      status: error?.response?.status,
      message,
      payload,
    });
  }

  return message;
}

export async function login({ nationalId, password }) {
  const payload = {
    nationalId: String(nationalId ?? '').trim(),
    password: String(password ?? ''),
  };

  if (isDev) {
    console.debug('[auth][login][payload]', payload);
  }

  try {
    const response = await authHttp.post('/auth/login', payload);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error('תעודת זהות או סיסמה שגויות.');
    }
    throw new Error(parseAxiosError(error, 'ההתחברות נכשלה. נסי שוב מאוחר יותר.'));
  }
}

export async function register({ nationalId, email, password, role = 'Student' }) {
  const payload = {
    nationalId: String(nationalId ?? '').trim(),
    email: String(email ?? '').trim(),
    password: String(password ?? ''),
    role: roleToValue[role] ?? roleToValue.Student,
  };

  if (isDev) {
    console.debug('[auth][register][payload]', payload);
  }

  try {
    await authHttp.post('/auth/register', payload);
  } catch (error) {
    if (error?.response?.status === 409) {
      throw new Error('המשתמשת כבר קיימת במערכת.');
    }
    throw new Error(parseAxiosError(error, 'ההרשמה נכשלה. נסי שוב מאוחר יותר.'));
  }
}

export async function refreshTokens(refreshToken) {
  const response = await authHttp.post('/auth/refresh', { refreshToken });
  return response.data;
}

export async function fetchMe() {
  const response = await authHttp.get('/auth/me');
  return response.data;
}

export async function logout(refreshToken) {
  await authHttp.post('/auth/logout', { refreshToken });
}
