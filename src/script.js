$(document).ready(function () {    
    // Function to change the #change-text
    function changeText() {
        const RNG = Math.floor(Math.random() * optionsArr.length);
        $("#change-text").text(optionsArr[RNG]);
    }

    // Function to change the content of #content
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
            }
            
            console.log(params);

            if(params.name !== "" && params.email !== "" && params.message !== "") {
                emailjs.send("service_e5x1bvy", "template_5lgmdyl", params, "CpWSL1rk6KmFcj2gi").then(function () {
                    alert("Email sent successfully.");
                });
            } else {
                alert("Please fill out all fields.");
            }
        }); 
    }

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

    const homeContent = `<h2> i'm <span class="green">andre</span>! </h2>
            <p class="lead">
                welcome to my humble abode :D
            </p>

            <p>
                what is this? well, i'm glad you asked! the gist is ~
                a simple website to showcase my projects and to learn more about me
            </p>
            
            <p>
                the main thing about me ... i love to explore and go on an adventure! if you see me 
                <b id="afk">afk</b> i'm usually:
            </p>

            <p>
                binge watching shows, playing video games or <span id="change-text"></span>.
            </p>`; 
    changeContent(homeContent); // initial content is homeContent

    let current = 0; // initial page is home, and arrays always start at 0

    let href = window.location.href; // Get current URL
    href = href.split("#")[0]; // Remove # from URL
    history.pushState({}, null, href + "#home"); // Change URL to current URL + #home

    // Event handler for home-link
    $("#home-link").click(function () {
        if (current !== 0) {
            current = 0;
            changeContent(homeContent);
        }
    });

    // Event handler for about-link
    $("#about-link").click(function () {
        if (current !== 1) {
            current = 1;
            const aboutContent = `<p class="lead">
                    in a nutshell, i am
                </p>

                <p>
                    a curious cat with a love for tech and a passion for learning. i am mostly into full stack development,
                    cloud computing, and practically anything that has to do with the web
                </p>
                
                <b>currently, i am</b>

                <p>
                    > a 2nd year co-op student studying computer science at <a class="link-text" href="https://www.torontomu.ca/">toronto metropolitan university</a>.
                </p>

                <p>
                    > developing a crypto app called <a class="link-text" href="https://github.com/andrearcaina/CoinWatch" target="_blank">CoinWatch</a>!
                </p>`; 
            changeContent(aboutContent);
        }
    });

    // Event handler for projects-link
    $("#projects-link").click(function () {
        if (current !== 2) {
            current = 2;
            const projectsContent = `W.I.P`; 
            changeContent(projectsContent);
        }
    });

    // Event handler for contact-link
    $("#contact-link").click(function () {
        if (current !== 3) {
            current = 3;
            const contactContent = `
                <form class="" action="" method="post">
                    <label for="name">name:</label>
                    <input 
                        class="input" 
                        type="text" 
                        id="name" 
                        name="name"
                        placeholder="your name"
                        onfocus="this.placeholder=''"
                    /><br/><br/>

                    <label for="email">email:</label>
                    <input
                        class="input"
                        type="text"
                        id="email"
                        name="email"
                        placeholder="your_email@example.com"
                        onfocus="this.placeholder=''"
                    /><br/><br/>

                    <label for="message">message:</label>
                    <input
                        class="input"
                        type="text"
                        id="message"
                        name="message"
                        placeholder="I like your website!"
                        onfocus="this.placeholder=''"
                    />

                    <button id="submit-button" name="send" type="button"> Send </button>
                </form>
            
            `;
            changeContent(contactContent);
        }
    });
});
