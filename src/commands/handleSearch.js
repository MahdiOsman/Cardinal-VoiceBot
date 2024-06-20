module.exports = (message) => {
  console.log("This is chatGpt Search!");
  const prompt = message.content.split(" ").slice(2).join(" ");
  
};
