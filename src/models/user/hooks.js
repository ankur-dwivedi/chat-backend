const FilterData = require('../filterData/services');

exports.initHooks = (UserSchema) => {
  UserSchema.post('save', async (docs) => {
    const { organization, employeeData } = docs;
    const filterData = await FilterData.get({ organization });
    if (filterData) {
      let data = filterData.data.map((val1) => {
        let data2 = employeeData.map((val2) => {
          if (val1.name === val2.name && val1.value.indexOf(val2.value) === -1)
            return { name: val1.name, value: [...val1.value, val2.value] };
        });
        data2 = data2.filter((val) => val && val !== null);
        return data2 !== null && data2.length ? data2[0] : val1;
      });
      let data3 = employeeData.map((val1) => {
        let flag = 0;
        let data2 = data.map((val2, index) => {
          if (val1.name === val2.name) {
            flag = 1;
          }
          if (val1.name !== val2.name && index == data.length - 1 && flag === 0) {
            flag = 1;
            return { name: val1.name, value: [val1.value] };
          }
        });
        data2 = data2.filter((val) => val && val !== null);
        return data2[0];
      });
      data3 = data3.filter((val) => val && val !== null);
      await FilterData.update({ organization }, { data: [...data, ...data3] });
    } else {
      const data = employeeData.map((val) => {
        return { name: val.name, value: [val.value] };
      });
      const createData = await FilterData.create({ organization, data });
    }
  });
};
