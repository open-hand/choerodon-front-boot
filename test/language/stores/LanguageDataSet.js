import updateLocaleContext from '../../../src/containers/components/util/updateLocaleContext';

export default {
  primaryKey: 'langCode',
  name: 'language',
  autoQuery: true,
  fields: [
    { name: 'langCode', type: 'string', label: '语言代码', required: true },
    { name: 'description', type: 'string', label: '描述', required: true },
  ],
  queryFields: [
    { name: 'langCode', type: 'string', label: '语言代码' },
    { name: 'description', type: 'string', label: '描述' },
  ],
  events: {
    submitSuccess: ({ dataSet, data }) => {
      const { success, rows, total } = data;
      if (success && total > 0) {
        updateLocaleContext(rows);
      }
    },
  },
};
