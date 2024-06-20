const { getAiResponse } = require("../utils/openAiUtils");

module.exports = async (message, prompt) => {
  getAiResponse(message, prompt);
};
