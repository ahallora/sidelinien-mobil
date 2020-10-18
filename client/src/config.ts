const dev = {
  apiGateway: {
    REGION: "eu-north-1",
    URL: "http://localhost:3000/dev"
  }
};

const prod = {
  apiGateway: {
    REGION: "eu-north-1",
    URL: " https://ybubgd3mj8.execute-api.eu-north-1.amazonaws.com/prod"
  }
};

// Default to dev if not set
const config = process.env.REACT_APP_STAGE === "prod" ? prod : dev;
export default config;
