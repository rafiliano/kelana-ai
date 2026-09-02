import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Read config from .env
KNOWLEDGE_BASE_ID       = os.getenv("KNOWLEDGE_BASE_ID")
KNOWLEDGE_BASE_MODEL_ARN = os.getenv("KNOWLEDGE_BASE_MODEL_ARN")
AWS_REGION              = os.getenv("AWS_REGION")
AWS_ACCESS_KEY_ID       = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY   = os.getenv("AWS_SECRET_ACCESS_KEY")

# bedrock-agent-runtime is the service for Knowledge Base queries
client = boto3.client(
    service_name          = "bedrock-agent-runtime",
    region_name           = AWS_REGION,
    aws_access_key_id     = AWS_ACCESS_KEY_ID,
    aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
)


def ask_knowledge_base(question: str) -> str:
    """
    Query the Bedrock Knowledge Base with a question.
    1. Retrieve relevant chunks from the knowledge base
    2. Pass them to the LLM to generate a grounded answer
    """
    # Step 1 — retrieve relevant chunks
    kb_result = retrieve_knowledge_base(question)
    context   = kb_result["answer"]  # joined snippets

    if not context:
        return "I could not find relevant information in the knowledge base."

    # Step 2 — send context + question to the LLM for a grounded answer
    bedrock_llm = boto3.client(
        service_name          = "bedrock-runtime",
        region_name           = AWS_REGION,
        aws_access_key_id     = AWS_ACCESS_KEY_ID,
        aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
    )

    prompt = (
        f"You are a helpful travel assistant.\n"
        f"Use only the following information to answer the question.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n"
        f"Answer:"
    )

    body = json.dumps({
        "messages": [
            {
                "role"    : "user",
                "content" : [{"text": prompt}]
            }
        ]
    })

    response = bedrock_llm.invoke_model(
        modelId     = KNOWLEDGE_BASE_MODEL_ARN,
        body        = body,
        contentType = "application/json",
        accept      = "application/json",
    )

    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]


def retrieve_knowledge_base(question: str, num_results: int = 5) -> dict:
    """
    Retrieve raw chunks from the Knowledge Base without generating an answer.
    Returns answer text joined from snippets, plus deduplicated sources.
    """
    response = client.retrieve(
        knowledgeBaseId        = KNOWLEDGE_BASE_ID,
        retrievalQuery         = {"text": question},
        retrievalConfiguration = {
            "managedSearchConfiguration": {
                "numberOfResults": num_results,
            },
        },
    )

    results      = response.get("retrievalResults", [])
    snippets     = []
    sources      = []
    seen_sources = set()

    for result in results:
        content = result.get("content", {})
        text    = content.get("text", "").strip()
        if text:
            snippets.append(text)

        source_key: str | None = result.get("documentId") or repr(result.get("location"))
        if source_key in seen_sources:
            continue
        seen_sources.add(source_key)
        sources.append(
            {
                "document_id" : result.get("documentId"),
                "location"    : result.get("location"),
                "metadata"    : result.get("metadata", {}),
                "score"       : result.get("score"),
            }
        )

    return {
        "answer"  : "\n\n".join(snippets),
        "sources" : sources,
    }
