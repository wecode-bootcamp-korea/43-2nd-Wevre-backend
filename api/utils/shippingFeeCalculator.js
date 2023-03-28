const feeList = [
  {
    volume: 1000000,
    weight: 100,
    fee: 250000,
  },
  {
    volume: 100000,
    weight: 50,
    fee: 200000
  },  
  {
    volume: 10000,
    weight: 10,
    fee: 150000
  },
  {
    volume: 1000,
    weight: 1,
    fee: 100000
  },
  {
    fee: 50000
  }
];

const isWithinRange = (option, volume, weight) => {
  return volume >= option.volume || weight >= option.weight;
}

const calculateShippingFee = (volume, weight) => {
  let fee = feeList[feeList.length - 1].fee;

  feeList.forEach((option) => {
    if (isWithinRange(option, volume, weight)) {
      fee = Math.max(fee, option.fee);
    }
  });
  
  return fee;
}

module.exports = {
  calculateShippingFee
};