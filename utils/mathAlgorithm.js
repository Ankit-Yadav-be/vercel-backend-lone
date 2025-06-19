
const calculateCompatibility = (userA, userB) => {
  let score = 0;

  if (userA.gender === userB.gender) return -1; 

  
  if (userA.personalityType === userB.personalityType) score += 20;


  const sharedValues = userA.values.filter(val => userB.values.includes(val));
  score += sharedValues.length * 10;


  if (userA.interests && userB.interests) {
    const sharedInterests = userA.interests.filter(val => userB.interests.includes(val));
    score += sharedInterests.length * 5;
  }

  if (userA.habits.sleep === userB.habits.sleep) score += 10;

  
  if (userA.habits.smoking === userB.habits.smoking) score += 5;
  if (userA.habits.drinking === userB.habits.drinking) score += 5;

  return score; 
};

module.exports = calculateCompatibility;
