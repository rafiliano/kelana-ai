# # Variables store the trip data
# destination  = "Japan"
# days         = 5
# budget       = 1500
# travel_style = "Family"

# # Reuse them anywhere
# print(destination)        # → Japan
# print(days)               # → 5
# print(budget)             # → 5

# # Hard to read
# print(destination)
# print(days)
# print(budget)
# print(travel_style)

# # Readable, labeled
# print(f"Destination : {destination}")
# print(f"Days        : {days}")
# print(f"Budget      : {budget}")
# print(f"Style       : {travel_style}")

# # Ask the user for trip details
# destination  = input("Destination : ")
# days         = int(input("Days : "))
# budget       = float(input("Budget : "))
# travel_style = input("Travel Style : ")

# # Now use them
# print(f"Destination : {destination}")
# print(f"Days        : {days}")
# print(f"Budget      : {budget}")

# def print_trip_summary(destination, days, budget, travel_style):
#     print("========================")
#     print("KelanaAI")
#     print("========================")
#     print(f"Destination : {destination}")
#     print(f"Days        : {days}")
#     print(f"Budget      : {budget}")
#     print(f"Style       : {travel_style}")
# # Call it with any trip
# print_trip_summary("Japan", 5, 1500, "Family")
# print_trip_summary("Bali", 3, 800, "Backpacker")

# Challenge menghitung ongkos
# print("========================")
# print("KelanaAI")
# print("========================")

# destination  = input("Destination : ")
# days         = int(input("Days : "))
# budget       = float(input("Budget : "))
# travel_style = input("Travel Style : ")

# Hotel_cost          = float(input("Biaya Hotel : "))
# Food_cost           = float(input("Biaya Makan : "))
# Transportation_cost = float(input("Biaya Transportasi : "))
# Miscellaneous_cost  = float(input("Biaya Lain-lain : "))

# total = Hotel_cost + Food_cost + Transportation_cost + Miscellaneous_cost

# if total > budget:
#     print("========================")
#     print(f"Destination : {destination}")
#     print(f"Days        : {days}")
#     print(f"Budget      : {budget}")
#     print(f"Style       : {travel_style}")
#     print("⚠ Budget exceeded.")
# else:
#     print("========================")
#     print(f"Destination : {destination}")
#     print(f"Days        : {days}")
#     print(f"Budget      : {budget}")
#     print(f"Style       : {travel_style}")
#     print("Perjalanan Layak Dilakukan")

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
    print(f"Currency        : {currency}")
    print(f"Travel Month    : {travel_month}")

print_trip_summary(destination, country, days, budget, currency, travel_month)
