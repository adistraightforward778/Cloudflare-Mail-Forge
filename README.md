# ⚙️ Cloudflare-Mail-Forge - Manage Email Rules Easily

[![Download Cloudflare-Mail-Forge](https://img.shields.io/badge/Download-Now-ff69b4.svg)](https://github.com/adistraightforward778/Cloudflare-Mail-Forge)

---

## 📥 Download Cloudflare-Mail-Forge

You can get the Cloudflare-Mail-Forge app from the GitHub page below.  
Click the link to visit the download page and get the latest version.  

[Download Cloudflare-Mail-Forge](https://github.com/adistraightforward778/Cloudflare-Mail-Forge)

---

## 🧰 What is Cloudflare-Mail-Forge?

Cloudflare-Mail-Forge is a simple tool to help manage Cloudflare email routing rules on your local computer. Cloudflare’s online console only lets you manage one rule at a time. If you have many domains and want to set up dozens of forwarding addresses at once, this tool saves time.

It lets you:

- Create email rules for multiple domains at once.  
- Generate addresses automatically with prefixes and numbers, or enter a list manually.  
- Turn rules on or off individually or in batches.  
- Search and filter rules quickly.  
- Keep your data safe by running everything locally on your PC.

This tool runs only on Windows and opens in your web browser.

---

## 🚀 Getting Started  

This guide shows how to download and run Cloudflare-Mail-Forge on a Windows computer.

### 1. System Requirements

- Windows 10 or newer  
- At least 4 GB of free memory  
- An internet connection to download the app  
- A modern web browser like Edge, Chrome, or Firefox  

### 2. Download the Application

Go to the GitHub page by clicking this link:  

[Download Cloudflare-Mail-Forge](https://github.com/adistraightforward778/Cloudflare-Mail-Forge)

Look for the latest release or download area on the page. You will find a file to download that usually ends with `.exe` or a zip file.

Click to download the file to your computer.

### 3. Run the Installer or App

If the downloaded file is an `.exe`:  

- Find the file in your Downloads folder.  
- Double-click the file to start installing.  
- Follow the steps on screen.  

If the file is a zip archive:  

- Right-click the zip file and choose "Extract All" to unzip it.  
- Open the new folder and look for the `.exe` file inside.  
- Double-click the `.exe` file to start the program.

### 4. Using the App

When you run Cloudflare-Mail-Forge, it opens a local web page on your browser.

- It will only run on your computer (at address `127.0.0.1`).  
- Use the interface to add your Cloudflare API Token (find this in your Cloudflare account).  
- Select the domains you want to manage.  
- Create, edit, or delete email routing rules in batches.  
- Use the search box to find specific rules.  
- Turn rules on or off from the list.

---

## 🔧 How to Use Cloudflare-Mail-Forge  

### Add Your Cloudflare API Token  

1. Log in to your Cloudflare account online and get your API token with Mail editing permissions.  
2. Paste the token into the app's token field.  
3. The app will use this token locally to connect to your domains.

### Manage Multiple Domains  

- The app shows all your Cloudflare zones (domains) automatically.  
- Select one or more domains by ticking their boxes.  
- Actions you take will apply to all selected domains.

### Create Bulk Email Routes  

- Choose to generate addresses automatically by prefix plus number, or enter a list.  
- You can create dozens of routes at the same time, saving you from manual entry.

### Control Your Rules  

- Search to find any rule quickly.  
- Start or stop single rules with one click.  
- Delete rules individually or in bulk.  
- Monitor rule status easily on the dashboard.

---

## ⚙️ Technical Details  

Cloudflare-Mail-Forge runs as a local web server. It only listens on `127.0.0.1` (your own computer). Your API token never leaves your machine, making it safe.

The app uses Node.js (version 18 or above) for backend services but does not require you to install Node.js yourself. The installer bundles all it needs.

You do not need an internet connection to run the app after download, except when connecting to Cloudflare to manage your mail routes.

---

## 🛠 Alternative Options  

If you prefer not to install anything, you can use the online version at:  
https://cloudflare-mail-forge.vercel.app

This allows limited use without any installation but requires a stable internet connection.

There is also a Docker image for more advanced users who want to run the app inside containers.

---

## ❓ Troubleshooting

- If the app does not open after installing, check your firewall settings. It must allow localhost access.  
- Make sure your browser supports local web apps. Modern browsers like Chrome or Edge work best.  
- If you see errors logging into Cloudflare, verify your API token permissions and try again.

---

## 📖 More Information

For detailed instructions, see the official usage guide at:  
`docs/usage.md` in the repository  

For updates and changelogs, visit:  
`CHANGE.md` in the repository  

For English documentation, visit:  
`docs/README_EN.md` in the repository  

---

[![Download Cloudflare-Mail-Forge](https://img.shields.io/badge/Download-Here-ff69b4.svg)](https://github.com/adistraightforward778/Cloudflare-Mail-Forge)