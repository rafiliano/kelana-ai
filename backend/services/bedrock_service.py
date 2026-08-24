import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
# so we can access them using os.getenv()
load_dotenv()

# Read AWS credentials and model config from .env
# Never hardcode secrets directly in code
AWS_ACCESS_KEY_ID     = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION            = os.getenv("AWS_REGION")
MODEL_ID              = os.getenv("MODEL_ID")

# Create a Bedrock client using boto3
# boto3 is the AWS SDK for Python
# bedrock-runtime is the service that lets us call AI models
bedrock = boto3.client(
    service_name          = "bedrock-runtime",
    region_name           = AWS_REGION,
    aws_access_key_id     = AWS_ACCESS_KEY_ID,
    aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
)

def get_ai_recommendation(days: int, destination: str, budget: float, travel_style: str) -> str:
    # Build the prompt that will be sent to the AI model
    # This is the instruction the AI reads to generate a response
    prompt = (
        f"You are an experienced travel planner.\n"
        f"Plan a {days}-day itinerary for {destination}.\n"
        f"Budget: USD {budget}\n"
        f"Travel Style: {travel_style}\n\n"
        f"Please provide:\n"
        f"- Daily itinerary\n"
        f"- Estimated daily budget\n"
        f"- Local food recommendations\n"
        f"- Transportation suggestions\n\n"
        f"Format your response as Markdown with headers (##) and bullet lists (-)."
    )

    # Wrap the prompt in the format Bedrock expects
    # content must be a JSONArray of objects with "text" field
    body = json.dumps({
        "messages": [
            {
                "role"    : "user",
                "content" : [
                    {"text": prompt}
                ]
            }
        ]
    })

    # Send the request to AWS Bedrock and get the response
    response = bedrock.invoke_model(
        modelId     = MODEL_ID,
        body        = body,
        contentType = "application/json",
        accept      = "application/json",
    )

    # Parse the response body from JSON
    # and extract the AI-generated text from the response structure
    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]
