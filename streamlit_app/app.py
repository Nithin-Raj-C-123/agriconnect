import streamlit as st

st.set_page_config(
    page_title="AgriConnect",
    page_icon="🌾",
    layout="centered"
)

st.title("🌾 AgriConnect")
st.subheader("Connecting Farmers Directly to Buyers")

st.write("""
AgriConnect is a digital platform that helps farmers:
- Upload crop details
- Sell directly to buyers
- Avoid middlemen
- Use voice & local language support
""")

st.divider()

st.header("🚜 Farmer Section")

crop = st.text_input("Crop Name")
quantity = st.number_input("Quantity (kg)", min_value=1)
price = st.number_input("Expected Price (₹ per kg)", min_value=1)
location = st.text_input("Location")

if st.button("Submit Crop Details"):
    st.success("✅ Crop details submitted successfully!")
