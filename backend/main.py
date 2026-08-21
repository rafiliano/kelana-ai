from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation
)
from fastapi import FastAPI, HTTPException
from models.trip import Trip
from database import SessionLocal, init_db

app = FastAPI()

init_db()


class TripRequest(BaseModel):
    destination  : str
    days         : int
    budget       : float
    travel_style : str

# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically

# a GET endpoint at the root path
@app.get("/")
def home():
    return {
        "message" : "Welcome to KelanaAI"
    }

@app.get("/health")
def health():
    return {
        "status" : "Ok"
    }

@app.get("/api/v1/trip_categories")
def trip_category():
    return {"Backpacker", "Standard", "Luxury"}

@app.get("/api/v1/recommendations")
def trip_recommendation():
    return {"Tokyo Tower", "Mount Fuji", "Shibuya"}

@app.get("/api/v1/transportations")
def trip_transportation():
    return {"Bus", "Train", "Flight"}


# POST endpoint — receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    # reuse Session 2 business logic
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)

    # create a Trip ORM object
    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = category,
        daily_budget = daily_budget,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)  # get the auto-generated id
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip