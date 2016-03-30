import Router from 'router';

var hereSpan = document.getElementById('Here');

Router.configure([
    {pattern: "/", page: "root"},
    {pattern: "/hello", page: "hello"},
    {pattern: "/world", page: "world"}
]);

Router.onChange(function (page, args) {
    hereSpan.innerText = page;
});
