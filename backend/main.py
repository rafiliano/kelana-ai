from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation
)
from services.bedrock_service import get_ai_recommendation
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.trip import Trip
from database import SessionLocal, init_db
from sqlalchemy import or_

app = FastAPI()

# Allow frontend at localhost:3000 to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:3000"],
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

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
    daily_budget     = calculate_daily_budget(request.budget, request.days)
    category         = get_trip_category(request.budget)
    ai_recommendation: str = get_ai_recommendation(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        travel_style = request.travel_style,
    )
    # create a Trip ORM object
    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = category,
        travel_style = request.travel_style,   # <-- baris baru
        daily_budget = daily_budget,
        ai_recommendation = ai_recommendation,
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

@app.get("/api/v1/trips/search")
def search_trips(destination: str = "", travel_style: str = ""):
    db = SessionLocal()
    query = db.query(Trip)

    if destination.strip():
        query = query.filter(Trip.destination.ilike(f"%{destination.strip()}%"))
    if travel_style.strip():
        query = query.filter(Trip.travel_style.ilike(f"%{travel_style.strip()}%"))

    trips = query.all()
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

@app.delete("/api/v1/trips/{trip_id}")
def del_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    # if not found, return 404
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    # if found, delete it
    db.delete(trip)
    db.commit()
    db.close()
    return {"message": f"Trip {trip_id} deleted successfully"}

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    # if not found, return 404
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    # only update days and budget if provided
    if request.days:
        trip.days = request.days
    if request.budget:
        trip.budget = request.budget

    trip.category     = get_trip_category(trip.budget)
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)

    db.commit()
    db.refresh(trip)
    db.close()
    return trip

    db.commit()
    db.refresh(trip)
    db.close()
    return trip
