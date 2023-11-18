$(document).ready(function () {   
    async function loadComponents(url, containerId) {
        return fetch(url)
            .then(response => response.text())
            .then(data => $(`#${containerId}`).html(data))
            .catch(error => console.error('Error fetching content:', error));
    }

    loadComponents('public/components/navbar.html', 'navbar');
    loadComponents('public/components/socials.html', 'socials');
});