import urllib.request
try:
    with urllib.request.urlopen("http://localhost:8002/api/sales/campaign/ce4f20eb-6968-4222-a06c-fa859ab6442a") as res:
        print(res.read().decode())
except Exception as e:
    print("Error:", e)
