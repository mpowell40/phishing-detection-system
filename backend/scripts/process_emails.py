import os
import pandas as pd


# Define a function to rename and standardize columns
def standardize_columns(df, filename):
    if filename in ['CEAS_08.csv', 'Nigerian_Fraud.csv']:
        df = df.rename(columns={'sender': 'sender', 'receiver': 'receiver', 'date': 'date'})  # Drop later
    if filename == 'phising_email.csv':
        df = df.rename(columns={'text_combined': 'body'})  # Ensure all datasets have 'body'
    return df

# Folder path to raw email datasets
data_folder = r"C:\Users\Owner\OneDrive\Desktop\Phising\data\raw\emails"

# List of files to process
file_paths = [
    "CEAS_08.csv",
    "Enron.csv",
    "Ling.csv",
    "Nigerian_Fraud.csv",
    "phising_email.csv"
]

email_dfs = []

# Process each dataset
for file in file_paths:
    file_path = os.path.join(data_folder, file)
    try:
        df = pd.read_csv(file_path)
        df = standardize_columns(df, file)
        email_dfs.append(df)
    except FileNotFoundError:
        print(f"File not found: {file_path}")

# Combine all datasets
combined_df = pd.concat(email_dfs, ignore_index=True)

# Drop unnecessary columns
columns_to_keep = ['subject', 'body', 'label', 'urls']
combined_df = combined_df[columns_to_keep] if 'urls' in combined_df.columns else combined_df[['subject', 'body', 'label']]

# Fill missing values with empty strings
combined_df.fillna('', inplace=True)

# Save cleaned dataset for later use
combined_df.to_csv("data/processed/emails_cleaned.csv", index=False)

print("Data preprocessing complete. Saved cleaned dataset as 'emails_cleaned.csv'.")


