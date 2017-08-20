'use strict';

function ExtractJwt (req) {
  let token = null;

  if (req.cookies && req.cookies.token != void(0)) {
    token = req.cookies['token'];
  }

  return token
}

module.exports = {
  jwt: {
    jwtFromRequest: ExtractJwt,
    secretOrKey: 'E95yFwChrPuHefjtwgegbS8WLaUemk8HQs3jsGNuNNKfmn5Sem2hLrHaDaRW8NasHYynxsf44f7XuCpGSndVPA6rhLgFVKbS4EnN2kNW'
  },

  expiresIn: '1 day'
};