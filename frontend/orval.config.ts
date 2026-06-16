  export default {
    edf: {
      input: '../api/openapi/edf-reader.yaml',
      output: {
        target: './src/api/generated.ts',
        client: 'react-query',
        mode: 'split',
        override: {
          mutator: {
            path: './src/api/axios-instance.ts',
            name: 'customAxios',
          },
        },
      },
    },
  };