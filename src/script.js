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

    function handleNavigation(fragment, index) {
        if (current !== index) {
            current = index;
            history.pushState({}, null, fragment);
            loadContent(content[index]);
        }
    }

    // function to load content from contentFile
    async function loadContent(contentFile) {
        return fetch(contentFile)
            .then(response => response.text())
            .then(data => changeContent(data))
            .catch(error => console.error('Error fetching content:', error));
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
        "working",
        "trying to survive university (•ᴖ•)"
    ];

    // array of content files
    const content = [
        '../public/pages/homeContent.html', 
        '../public/pages/aboutContent.html', 
        '../public/pages/projectsContent.html', 
        '../public/pages/contactContent.html'
    ];

    const fragments = ["#home", "#about", "#projects", "#contacts"];

    let current = 0;

    // initial load of content when page is loaded/refreshed
    history.replaceState({}, null, '#home');
    loadContent(content[0]);

    // handle popstate event
    // essentially, this is called when the user navigates to a new page or when the user refreshes the page
    // this is necessary because the browser does not reload the page when the user navigates to a new page
    // or when the user refreshes the page
    $(window).on("popstate", function (event) {
        const currentFragment = window.location.hash;

        switch (currentFragment) {
            case fragments[0]:
                handleNavigation(fragments[0], 0);
                break;
            case fragments[1]:
                handleNavigation(fragments[1], 1);
                break;
            case fragments[2]:
                handleNavigation(fragments[2], 2);
                break;
            case fragments[3]:
                handleNavigation(fragments[3], 3);
                break;
            default:
                console.log("Error: Invalid fragment identifier.");
        }
    });

    $("#home-link").click(function () {
        handleNavigation(fragments[0], 0);
    });

    $("#about-link").click(function () {
        handleNavigation(fragments[1], 1);
    });

    $("#projects-link").click(function () {
        handleNavigation(fragments[2], 2);
    });

    $("#contact-link").click(function () {
        handleNavigation(fragments[3], 3);
    });
});