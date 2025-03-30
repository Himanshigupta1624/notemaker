const API_URL="http://localhost:8000/api";

// DOM Elements
document.addEventListener("DOMContentLoaded",function(){
    // handle login form
    const loginform=document.getElementById("login-form");
    if (loginform){
        loginform.addEventListener("submit",handleLogin);
    }
    // handle registration form
    const registerform=document.getElementById("register-form");
    if (registerform){
        registerform.addEventListener("submit",handleRegister);
    }
    // handle logout
    const logoutBtn=document.getElementById("logout-btn");
    if (logoutBtn){
        logoutBtn.addEventListener("click",handleLogout);
    }

    // check authentictaion status for protected pages
    const protectedPages= [
        "dashboard.html",
        "created-note.html",
        "view-note.html",
        "user-info.html",
        "users.html"
    ]
    const currentPage =window.location.pathname.split("/").pop();
    if (protectedPages.includes(currentPage)){
        checkAuth();
    }

    // handle mobile menue toggle
    const mobileMenuToggle=document.getElementById("mobile-menu-toggle");
    if (mobileMenuToggle){
        mobileMenuToggle.addEventListener("click",function(){
            document.querySelector(".nav-links").classList.toggle("active");
        });
    }
    updatedUI();
});

// Authentication Handlers
async function  handleLogin(e) {
    e.preventDefault();
    const email =document.getElementById("email").value;
    const password=document.getElementById("password").value;
    try{
        showLoading();
        const response =await fetch(`${API_URL}/login/`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({ email,password})
        });
        const data=await response.json();
        if (!response.ok){
            throw new Error(data.detail || JSON.stringify(data));
        }
        // Store tokens
        localStorage.setItem("accessToken",data.access);
        localStorage.setItem("refreshToken",data.refresh);
        if (data.user && data.user.id) {
            localStorage.setItem("userId", data.user.id);
        } else {
            console.warn("User ID not found in response");
        }
        window.location.href="dashboard.html"
    }
    catch(error){
        showAlert("error",error.message);
    }
    finally{
        hideLoading();
    }
    
}
async function handleRegister(e) {
    e.preventDefault();
    const email =document.getElementById("email").value;
    const username =document.getElementById("username").value;
    const firstName =document.getElementById("first_name").value;
    const lastName =document.getElementById("last_name").value;
    const password =document.getElementById("password").value;
    const password2=document.getElementById("password2").value;

    if(password !== password2){
        showAlert("error","Password don't match");
        return;
    }
    try{
        showLoading();
        const response =await fetch(`${API_URL}/register/`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                username,
                first_name:firstName,
                last_name:lastName,
                password,
                password2

            })
        });
        const data =await response.json();
        if (!response.ok){
            const errors =Object.values(data).flat().join(", ");
            throw new Error(data.detail || JSON.stringify(data));
        }
        localStorage.setItem("accessToken",data.access);
        localStorage.setItem("refreshToken",data.refresh);
        localStorage.setItem("userId",data.user.id);
        window.location.href="dashboard.html"

    }
    catch (error){
        showAlert("error",error.message);

    }
    finally{
        hideLoading();
    }
}
function handleLogout(e){
    e.preventDefault();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    window.location.href="login.html"
}

function hideLoading() {
    const loadingEl = document.getElementById("loading-indicator");
    if (loadingEl) {
        document.body.removeChild(loadingEl);
    }
}
function isAuthenticated(){
    return localStorage.getItem("accessToken")!==null;
}

 async function checkAuth(){
    if (!isAuthenticated()){
        window.location.href="login.html";
        return;
    }
    try{
        const response = await fetch (`${API_URL}/users/me/`,{
            headers: getAuthHeaders()
        });
        if (!response.ok){
            // If token is invalid, try refreshing
            const refreshed =await refreshToken();
            if(!refreshed){
                throw new Error("Authentication failed")
            }
        }

    }
    catch (error){
        console.error("Auth Check Failed:",error);
        window.location.href="login.html"

    }
}

async function refreshToken() {
    const refreshToken=localStorage.getItem("refreshToken");
    if (!refreshToken){
        return false;

    }
    try{
        const respose=await fetch(`${API_URL}/token/refresh/`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                refresh:refreshToken
            })
        });
        if (!respose.ok){
            throw new Error("Token refresh failed");
        }
        const data=await respose.json();
        localStorage.setItem("accessToken",data.access);
        return true;

    }
    catch(error){
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        return false;

    }
}

// API request helpers
function getAuthHeaders(){
    const token= localStorage.getItem("accessToken");
    return{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${token}`
    };
}
async function fetchWithAuth(url, options={}) {
    console.log(`fetchWithAuth: ${url}`);
    // Add auth headers
    options.headers = {
        ...options.headers,
        ...getAuthHeaders()
    };
    
    console.log("Headers:", JSON.stringify(options.headers));
    
    let response = await fetch(url, options);
    console.log(`Initial response status: ${response.status}`);
    
    // If unauthorized try to refresh token 
    if (response.status === 401) {
        console.log("Attempting token refresh...");
        const refreshed = await refreshToken();
        
        if (refreshed) {
            console.log("Token refreshed, retrying request");
            options.headers = {
                ...options.headers,
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            };
            response = await fetch(url, options);
            console.log(`After refresh response status: ${response.status}`);
        }
    }
    
    return response; // Make sure there's a return!
}
// Ui helpers
function showAlert(type,message){
    const alertContainer=document.getElementById("alert-container");
    if (!alertContainer) return;
    const alertClass=type ==="error" ? "alert-danger":
                    type === "warning" ? "alert-warning" :"alert-success";
    alertContainer.innerHTML=`
    <div class="alert ${alertClass}">
    ${message}
    </div>
    `;
    // Auto dismiss after 5 seconds
    setTimeout(()=>{
        alertContainer.innerHTML="";
    },5000);                
}
function showLoading(){
    const loadingEl=document.createElement("div");
    loadingEl.id="loading-indicator";
    loadingEl.innerHTML=`<div class ="spinner"></div>`;
    loadingEl.style.position="fixed";
    loadingEl.style.top="0";
    loadingEl.style.left="0";
    loadingEl.style.width="100%";
    loadingEl.style.height="100%";
    loadingEl.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    loadingEl.style.display = "flex";
    loadingEl.style.justifyContent = "center";
    loadingEl.style.alignItems = "center";
    loadingEl.style.zIndex = "9999";

    document.body.appendChild(loadingEl);
}
function updatedUI(){
    const IsLoggedIn= isAuthenticated();

    const authNav=document.getElementById("auth-nav");
    const userNav=document.getElementById("user-nav");

    if (authNav && userNav){
        authNav.style.display=IsLoggedIn ? "none" :"flex";
        userNav.style.display=IsLoggedIn ? "flex" : "none";
    }
}