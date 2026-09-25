import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      strict: true,
    }),
    paths: {
      base: process.env.BASE_PATH ?? '',
    },
    prerender: {
      handleHttpError: ({ path, message }) => {
        if (path.includes('/assets/img/products/')) return;
        throw new Error(message);
      },
    },
  },
};

export default config;
