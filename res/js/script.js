window.onscroll = function () {
    stickyNavigationBar()
};
var header = document.getElementById("navigation");
var sticky = header.offsetTop;

function stickyNavigationBar() {
    if (window.pageYOffset > sticky) {
        header.classList.add("shadow");
    } else {
        header.classList.remove("shadow");
    }
}

$(".local-link").on("click", function (event) {
    event.preventDefault();
    $('html , body').animate({
        scrollTop: document.querySelector($(this).attr("href")).offsetTop - 60
    });
})

fetch("https://www.instagram.com/xxdev.id/").then(response => response.text()).then((html) => {
    var parser = new DOMParser();
    var domResult = parser.parseFromString(html, 'text/html');
    var script = domResult.querySelectorAll("script")[4];
    var scrappingIg = new Function(script.outerHTML.replace(/<\/script>|<script type="text\/javascript">/g, ""));
    scrappingIg();
    window.instagramScrappingResult = window._sharedData.entry_data.ProfilePage[0].graphql.user;
    window.instagramScrappingHtml = '';
    window.instagramScrappingResult.edge_owner_to_timeline_media.edges.forEach(function (media, index) {
        if (index < 3) {
            window.instagramScrappingHtml += `
                        <div class="blog-col">
                            <a href="https://www.instagram.com/p/` + media.node.shortcode + `" target="_blank">
                                <div class="blog">
                                    <div class="blog-header">
                                        <img src="${media.node.thumbnail_src}" alt="">
                                    </div>
                                    <div class="blog-body">
                                        <p>
                                            ${media.node.edge_media_to_caption.edges[0].node.text.substring(0,130)}...
                                        </p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;
        }
    });
    $("#instagram-container").html(window.instagramScrappingHtml)
});

$(".portfolio-container").mousewheel(function (event, delta) {
    this.scrollLeft -= (delta);
    event.preventDefault();
});