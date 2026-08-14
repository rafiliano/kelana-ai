# Pemecahan modul penting sehingga kita bisa memecah kebutuhan pemrosesan suatu proses secara spesifik, ex user_service, trip_service dsb

def calculate_daily_budget(budget, days):
    return budget / days

def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_transportation_recommendation(category):
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"

def get_recommended_place(country):
    recommendations = {
        "Japan"     : ["Tokyo Tower", "Shibuya", "Mount Fuji"],
        "Bali"      : ["Ubud", "Kuta Beach", "Tanah Lot"],
        "Singapore" : ["Marina Bay Sands", "Gardens by the Bay", "Sentosa"],
    }
    return recommendations.get(country, ["City Center", "Local Market", "Popular Landmark"])

def get_season_definition(travel_month):
    if travel_month == "December":
        return "Peak Season"
    elif travel_month == "June":
        return "Holiday Season"
    else:
        return "Regular Season"
