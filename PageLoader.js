class PageLoader {
    constructor() {
        this.style = null;
        this.script = null;
        this.currentPage = null;
    }

    loadStylesheet(url, callback) {
        $.ajax({
            url: url,
            dataType: 'text',
            success: (cssContent) => {
                this.style = $('<style>', {
                    type: 'text/css',
                    text: cssContent,
                }).appendTo('head');
                if (callback) callback();
            },
            error: () => {
                console.error('Failed to load CSS file:', url);
            },
        });
    }

    unloadStylesheet() {
        if (this.style) {
            this.style.remove();
            this.style = null;
        }
    }

    loadScript(url, callback) {
        $.ajax({
            url: url,
            dataType: 'script',
            cache: false,
            success: function() {
                if (typeof callback === 'function') {
                    callback();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(`Failed to load script: ${url}`);
                console.error(`Status: ${textStatus}`);
                console.error(`Error thrown: ${errorThrown}`);
            }
        });
    }

    unloadScript() {
        if (this.script) {
            this.script.remove();
            this.script = null;
        }
    }

    loadHTML(url, post_params, callback) {
        $.post(url, post_params)
            .done((data) => {
                $('#main-content').html(data);
                if (callback) callback();
            })
            .fail(() => {
                console.error(`Failed to load ${url}`);
                alert('Error loading content. Please try again.');
            });
    }

    unloadHTML() {
        $('#main-content').empty();
    }

    loadPage(pageId, post_params, event) {
        if (event) {
            event.preventDefault(); // Prevent default link behavior
        }

        const cssUrl = `${pageId}.css`;
        const htmlUrl = `${pageId}.html`;
        const jsUrl = `${pageId}.js`;

        $('#loadingDialog').fadeIn();
        this.unloadPage();

        this.loadStylesheet(cssUrl, () => {
            console.log('Stylesheet loaded successfully');
            this.loadHTML(htmlUrl, post_params, () => {
                this.loadScript(jsUrl, () => {
                    console.log('Script loaded successfully');
                    $('#loadingDialog').fadeOut();
                    this.currentPage = pageId;
                });
            });
        });
    }

    unloadPage() {
        this.unloadStylesheet();
        this.unloadScript();
        this.unloadHTML();
    }
}

const loader = new PageLoader();

// Event handling for sidebar links
$('.sidebar-item').on('click', function(event) {
    const pageId = $(this).attr('id');
    loader.loadPage(pageId, null, event);
});
