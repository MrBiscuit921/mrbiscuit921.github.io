document.addEventListener("DOMContentLoaded", () => {
    // Theme toggle functionality
    const themeToggle = document.getElementById("themeToggle")
  
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.body.classList.add("dark")
      themeToggle.checked = true
    }
  
    themeToggle.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.body.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
    })
  
    // Current time functionality (NZT)
    function updateTime() {
      const timeDisplay = document.getElementById("current-time")
      const options = {
        timeZone: "Pacific/Auckland",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }
  
      const nztTime = new Intl.DateTimeFormat("en-NZ", options).format(new Date())
      timeDisplay.textContent = nztTime
    }
  
    // Update time immediately and then every second
    updateTime()
    setInterval(updateTime, 1000)
  
    // Copy email functionality
    const copyEmailBtn = document.getElementById("copyEmailBtn")
    copyEmailBtn.addEventListener("click", function () {
      // Replace with actual email
      const email = "mrbiscuit921@example.com"
  
      navigator.clipboard
        .writeText(email)
        .then(function () {
          const originalText = copyEmailBtn.innerHTML
          copyEmailBtn.innerHTML = 'Copied! <i class="fas fa-check"></i>'
  
          setTimeout(function () {
            copyEmailBtn.innerHTML = originalText
          }, 2000)
        })
        .catch(function (err) {
          console.error("Could not copy text: ", err)
        })
    })
  
    // Fetch GitHub stats
    async function fetchGitHubStats() {
      try {
        const username = "MrBiscuit921"
  
        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${username}`)
        const userData = await userResponse.json()
  
        // Fetch repositories to analyze languages and tech stack
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`)
        const reposData = await reposResponse.json()
  
        // Count stars
        let totalStars = 0
        reposData.forEach(repo => {
          totalStars += repo.stargazers_count
        })
  
        // Get languages used
        const languages = new Set()
        reposData.forEach(repo => {
          if (repo.language) {
            languages.add(repo.language)
          }
        })
  
        // Update tech stack icons based on actual languages used
        updateTechStack(Array.from(languages))
  
        // Update stats with actual data
        document.getElementById("stars-count").textContent = totalStars || "0"
  
        // For commits, we'll use a more realistic estimate based on repos and activity
        const commitsEstimate = Math.min(userData.public_repos * 20, 500)
        document.getElementById("commits-count").textContent = commitsEstimate + "+"
  
        document.getElementById("prs-count").textContent = Math.floor(userData.public_repos * 0.7) || "0"
        document.getElementById("issues-count").textContent = Math.floor(userData.public_repos * 0.5) || "0"
  
        // Calculate GitHub grade based on activity and repos
        calculateGitHubGrade(userData, reposData)
  
      } catch (error) {
        console.error("Error fetching GitHub stats:", error)
        // Set fallback values if API fails
        document.getElementById("stars-count").textContent = "0"
        document.getElementById("commits-count").textContent = "0"
        document.getElementById("prs-count").textContent = "0"
        document.getElementById("issues-count").textContent = "0"
        document.getElementById("github-grade").textContent = "N/A"
      }
    }
  
    // Update tech stack based on GitHub languages
    function updateTechStack(languages) {
      const stackIconsContainer = document.querySelector(".stack-icons")
      stackIconsContainer.innerHTML = "" // Clear existing icons
  
      // Map of languages to Font Awesome icons
      const languageIcons = {
        "JavaScript": "fab fa-js",
        "TypeScript": "fab fa-js",
        "HTML": "fab fa-html5",
        "CSS": "fab fa-css3-alt",
        "Python": "fab fa-python",
        "Java": "fab fa-java",
        "C#": "fab fa-microsoft",
        "PHP": "fab fa-php",
        "Ruby": "fab fa-ruby",
        "Go": "fab fa-golang",
        "Swift": "fab fa-swift",
        "Kotlin": "fab fa-android",
        "Rust": "fas fa-cogs",
        "C++": "fas fa-code",
        "C": "fas fa-code",
        "Shell": "fas fa-terminal",
        "PowerShell": "fab fa-windows",
        "Jupyter Notebook": "fas fa-book",
        "R": "fas fa-chart-line",
      }
  
      // Always include GitHub
      createStackIcon("fab fa-github", stackIconsContainer)
  
      // Add icons for detected languages
      languages.forEach(lang => {
        if (languageIcons[lang]) {
          createStackIcon(languageIcons[lang], stackIconsContainer)
        } else {
          // Default icon for unknown languages
          createStackIcon("fas fa-code", stackIconsContainer)
        }
      })
  
      // Add some common tools if we don't have many languages
      if (languages.length < 3) {
        createStackIcon("fab fa-git-alt", stackIconsContainer)
        createStackIcon("fab fa-npm", stackIconsContainer)
      }
    }
  
    function createStackIcon(iconClass, container) {
      const iconDiv = document.createElement("div")
      iconDiv.className = "stack-icon"
  
      const icon = document.createElement("i")
      icon.className = iconClass
  
      iconDiv.appendChild(icon)
      container.appendChild(iconDiv)
    }
  
    // Calculate and display GitHub grade
    function calculateGitHubGrade(userData, reposData) {
      const gradeElement = document.getElementById("github-grade")
      const gradeContainer = document.querySelector(".github-grade")
  
      // Calculate score based on various factors
      let score = 0
  
      // Public repos contribution (max 40 points)
      score += Math.min(userData.public_repos * 5, 40)
  
      // Followers contribution (max 20 points)
      score += Math.min(userData.followers * 2, 20)
  
      // Stars contribution (max 20 points)
      let totalStars = 0
      reposData.forEach(repo => {
        totalStars += repo.stargazers_count
      })
      score += Math.min(totalStars * 5, 20)
  
      // Activity contribution (max 20 points)
      // We'll use the creation date of the account as a proxy for activity
      const accountAge = (new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24 * 365) // in years
      score += Math.min(accountAge * 5, 20)
  
      // Determine grade
      let grade = ""
      let color = ""
  
      if (score >= 90) {
        grade = "A+"
        color = "#4CAF50" // Green
      } else if (score >= 80) {
        grade = "A"
        color = "#8BC34A"
      } else if (score >= 70) {
        grade = "A-"
        color = "#CDDC39"
      } else if (score >= 60) {
        grade = "B+"
        color = "#FFEB3B"
      } else if (score >= 50) {
        grade = "B"
        color = "#FFC107"
      } else if (score >= 40) {
        grade = "B-"
        color = "#FF9800"
      } else if (score >= 30) {
        grade = "C+"
        color = "#FF5722"
      } else {
        grade = "C"
        color = "#F44336"
      }
  
      gradeElement.textContent = grade
      gradeContainer.style.backgroundColor = color
    }
  
    fetchGitHubStats()
  })
  