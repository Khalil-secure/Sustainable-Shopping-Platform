const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: 'us-east-1' }); // adapte à ta région

exports.handler = async (event) => {
  const productId = event.queryStringParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing productId" })
    };
  }

  const data = await dynamo.get({
    TableName: "AmazonProductData",
    Key: { productId }
  }).promise();

  if (!data.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" })
    };
  }

  // 🧠 Prompt intégré
  const prompt = `
Tu es un expert en durabilité, écoconception et conformité réglementaire européenne.

Analyse les données suivantes d’un produit Amazon-like :

- Titre : ${data.Item.title}
- Prix : ${data.Item.price}
- Évaluation : ${data.Item.rating}
- Nombre d’avis : ${data.Item.reviews}
- Matériaux : ${data.Item.materials}
- URL : ${data.Item.url}

Génère un rapport structuré contenant :

1. ✅ Score de circularité (0 à 100) basé sur :
   - Durabilité
   - Réparabilité
   - Recyclabilité
   - Présence de matériaux recyclés
   - Facilité de démontage

2. 📈 Estimation de la valeur à vie :
   - Coût par usage
   - Longévité estimée
   - Fréquence de remplacement probable
3. 🇪🇺 Conformité aux normes européennes de durabilité :
   - Respecte-t-il le Règlement ESPR (EU 2024/1781) ?
   - Est-il compatible avec le Passeport Produit Numérique (DPP) ?
   - Informations sur l’origine, les matériaux, l’impact environnemental, les recommandations de fin de vie

4. 📄 Justification claire :
   - Pourquoi ce produit est ou n’est pas conforme
   - Points forts et faibles
   - Recommandations pour améliorer sa conformité
`;

  const body = {
    prompt: prompt,
    max_tokens: 1024,
    temperature: 0.7
  };

  try {
    const response = await bedrock.invokeModel({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0', // ou autre modèle Bedrock
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body)
    }).promise();

    const result = JSON.parse(response.body.toString());
    const report = result.completion || result.output || "No output";

    return {
      statusCode: 200,
      body: JSON.stringify({ report })
    };
  } catch (error) {
    console.error("Bedrock error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error generating report", error })
    };
  }
};
