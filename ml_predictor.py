import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error



df = pd.read_csv("priceiq_dataset_cleaned.csv")


df["date"] = pd.to_datetime(df["date"])


print("\nAvailable products in dataset:\n")
print(df["product_name"].drop_duplicates().head(40))



df = df.sort_values(["product_id", "retailer", "date"])



df["future_price"] = df.groupby(["product_id", "retailer"])["price"].shift(-7)

df = df.dropna()



df["day_of_week"] = df["date"].dt.dayofweek
df["day_of_month"] = df["date"].dt.day

X = df[["price", "day_of_week", "day_of_month"]]
y = df["future_price"]



X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)



model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)

print("\nModel trained successfully")
print("MAE (Mean Absolute Error):", round(mae,2))



def analyze_product(product_name):

    product_data = df[df["product_name"] == product_name]

    if product_data.empty:
        print("\nProduct not found")
        return

    # prendre la date la plus récente
    latest_date = product_data["date"].max()

    latest_prices = product_data[product_data["date"] == latest_date]

    # trouver le meilleur prix
    best_row = latest_prices.loc[latest_prices["price"].idxmin()]

    best_price = best_row["price"]
    best_retailer = best_row["retailer"]
    date = best_row["date"]

    day_of_week = date.dayofweek
    day_of_month = date.day

    input_data = pd.DataFrame([{
        "price": best_price,
        "day_of_week": day_of_week,
        "day_of_month": day_of_month
    }])

    predicted_price = model.predict(input_data)[0]

    print("\nProduct :", product_name)
    print("Best current price :", round(best_price,2))
    print("Best retailer :", best_retailer)

    print("\nPredicted price in 7 days :", round(predicted_price,2))

    if predicted_price < best_price:
        print("Recommendation : WAIT (price expected to drop)")
    elif predicted_price > best_price:
        print("Recommendation : BUY NOW (price expected to rise)")
    else:
        print("Recommendation : NEUTRAL")

# ===============================
# 8) Demander le produit
# ===============================

product = input("\nEnter product name : ")

analyze_product(product)