import axios from 'axios';
const ENVIRONMENTS = {
	development: {
		localhost: 'https://planb.test/api/',
		'planb.test': 'https://planb.test/api/',
	},
	production: {
		'planb.studiovimana.com.ar': 'https://planb.studiovimana.com.ar/api/',
		'soyplanb.com.ar': 'https://soyplanb.com.ar/api/',
	},
};

const getBaseURL = () => {
	const hostname = window.location.hostname;

	for (const [env, hosts] of Object.entries(ENVIRONMENTS)) {
		if (hosts[hostname]) {
			return hosts[hostname];
		}
	}

	console.warn(`Unknown hostname "${hostname}", falling back to localhost`);
	return ENVIRONMENTS.development.localhost;
};

const axiosClient = axios.create({
	baseURL: getBaseURL(),
	headers: {
		'Accept': 'application/json',
	},
});

axiosClient.interceptors.request.use((config) => {
	const token = localStorage.getItem('ACCESS_TOKEN');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}


	if (config.data instanceof FormData) {
		delete config.headers['Content-Type'];
	}

	return config;
});

axiosClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const { response } = error;

		// 401: Unauthorized
		// 419: Authentication Timeout (Laravel CSRF/Session)
		if (response && [401, 419].includes(response.status)) {
			// Clear local storage to prevent infinite loops or invalid states
			localStorage.removeItem('ACCESS_TOKEN');
			localStorage.removeItem('USER_ROLES');
			localStorage.removeItem('USER_PERMISSIONS');
			localStorage.removeItem('TOKEN_EXPIRES_AT');
			localStorage.removeItem('REMEMBER_ME');

			// Optional: Prevent redirect if we're already on login to avoid loops
			if (window.location.pathname !== '/vadmin/login') {
				window.location.href = '/vadmin/login';
			}
		}

		return Promise.reject(error);
	}
);

export default axiosClient;
