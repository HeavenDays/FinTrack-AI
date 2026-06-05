async function getFreeModels() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    const data = await res.json();
    const freeModels = data.data
      .filter((model: any) => {
        // Find models with 0 price (free)
        const isFreePrompt = parseFloat(model.pricing.prompt) === 0;
        const isFreeCompletion = parseFloat(model.pricing.completion) === 0;
        return isFreePrompt && isFreeCompletion;
      })
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        context_length: model.context_length
      }));
      
    console.log("Free Models Available:");
    console.log(JSON.stringify(freeModels, null, 2));
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

getFreeModels();
