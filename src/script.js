$(document).ready(function () {
    // function to change the #change-text
    function changeText() {
        const RNG = Math.floor(Math.random() * optionsArr.length);
        $("#change-text").text(optionsArr[RNG]);
    }

    // function to change the content of #content
    function changeContent(content) {
        $("#content").empty(); // Remove existing content
        $("#content").append(content); // Add new content

        // changeText is called here to ensure that the text is changed when the user navigates to a new page
        // or when the user refreshes the page
        changeText();

        // Change text when #change-text is clicked
        $("#change-text").click(changeText);

        // Add tooltip to #afk
        $("#afk").tooltip({
            title: "if andre is afk, he is not coding :O"
        });

        $("#submit-button").click(function () {
            let params = {
                name: $("#name").val(),
                email: $("#email").val(),
                message: $("#message").val()
            };

            console.log(params);

            if (params.name !== "" && params.email !== "" && params.message !== "") {
                emailjs.send("service_e5x1bvy", "template_5lgmdyl", params, "CpWSL1rk6KmFcj2gi").then(function () {
                    alert("Email sent successfully.");
                });
            } else {
                alert("Please fill out all fields.");
            }
        });
    }

    // maybe add more options later and make it so that it doesn't repeat the same option twice in a row
    const optionsArr = [
        "biking", 
        "swimming", 
        "studying", 
        "eating", 
        "sleeping", 
        "hanging out with friends", 
        "listening to music", 
        "failing my exams",
        "reading books",
        "watching movies",
        "playing sports",
        "exploring new technologies",
        "volunteering",
        "learning new languages",
        "working"
    ];

    // array of content files
    const content = [
        '../pages/homeContent.html', 
        '../pages/aboutContent.html', 
        '../pages/projectsContent.html', 
        '../pages/contactContent.html'
    ];

    // function to load content from contentFile
    async function loadContent(contentFile) {
        return fetch(contentFile)
            .then(response => response.text())
            .then(data => changeContent(data))
            .catch(error => console.error('Error fetching content:', error));
    }

    // Initial page load
    loadContent(content[0]);

    // handle popstate event
    // essentially, this is called when the user navigates to a new page or when the user refreshes the page
    // this is necessary because the browser does not reload the page when the user navigates to a new page
    // or when the user refreshes the page
    window.addEventListener("popstate", function (event) {
        const currentFragment = window.location.hash;

        switch (currentFragment) {
            case "#home":
                loadContent(content[0]);
                break;
            case "#about":
                loadContent(content[1]);
                break;
            case "#projects":
                loadContent(content[2]);
                break;
            case "#contacts":
                loadContent(content[3]);
                break;
            default:
                console.error('Invalid fragment:', currentFragment);
        }
    });

    // event handlers for navigation links
    // pushState is used to change the URL without reloading the page
    $("#home-link").click(function () {
        history.pushState({}, null, '#home');
        loadContent(content[0]);
    });

    $("#about-link").click(function () {
        history.pushState({}, null, '#about');
        loadContent(content[1]);
    });

    $("#projects-link").click(function () {
        history.pushState({}, null, '#projects');
        loadContent(content[2]);
    });

    $("#contact-link").click(function () {
        history.pushState({}, null, '#contacts');
        loadContent(content[3]);
    });
});