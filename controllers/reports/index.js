const modules = require('./modules');
// cons
module.exports = function(app, firebase, server, socket) {
  // fire modules
  modules(server, firebase, socket);

  app.get('/response', (req, res) => {
    res.render('reports', {
      title: 'ERA | Reports',
      description: 'Responding to 10 clients',
    });
  });
};
