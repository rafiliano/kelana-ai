from services.trip_service import calculate_daily_budget, get_trip_category, get_transportation_recommendation, get_recommended_place, get_season_definition

# Homework — Enrich the Trip Summary
print("========================")
print("KelanaAI")
print("========================")
print("Where do you want to go?")

destination  = input("Destination : ")
country      = input("Country : ")
days         = int(input("Days : "))
budget       = float(input("Budget : "))
currency     = input("Currency : ")
travel_month = input("Travel Month : ")

def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print("========================")
    print("Trip Summary")
    print("========================")
    print(f"Destination     : {destination}")
    print(f"Country         : {country}")
    print(f"Days            : {days}")
    print(f"Budget          : {budget} {currency}")
    print(f"Travel Month    : {travel_month}")

print_trip_summary(destination, country, days, budget, currency, travel_month)

daily     = calculate_daily_budget(budget, days)
category  = get_trip_category(budget)
transport = get_transportation_recommendation(category)
places    = get_recommended_place(country)
season    = get_season_definition(travel_month)

print(f"Season          : {season}")
print(f"Category        : {category}")
print(f"Daily Budget    : {daily} {currency}/day")
print(f"Transportation  : {transport}")
print(f"Recommended     : {places}")

input("Press Enter to exit...")
