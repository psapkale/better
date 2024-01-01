import { g, auth, config, connector } from '@grafbase/sdk';

// @ts-ignore
const User = g
   .model('User', {
      name: g.string().length({ min: 2, max: 100 }),
      email: g.string().unique(),
      avatarUrl: g.url(),
      description: g.string().length({ min: 2, max: 100 }).optional(),
      projects: g
         .relation(() => Project)
         .list()
         .optional(),
      githubUrl: g.url().optional(),
      linkedIn: g.url().optional(),
   })
   .auth((rules) => rules.public().read());

// @ts-ignore
const Project = g
   .model('Project', {
      title: g.string().length({ min: 3 }),
      description: g.string(),
      image: g.url(),
      liveSiteUrl: g.url(),
      githubUrl: g.url(),
      category: g.string().search(),
      createdBy: g.relation(() => User),
   })
   .auth((rules) => {
      rules.public().read();
      rules.private().create().delete().update();
   });

const jwt = auth.JWT({
   issuer: 'grafbase',
   secret: g.env('NEXTAUTH_SECRET'),
});

export default config({
   schema: g,
   auth: {
      providers: [jwt],
      rules: (rules) => rules.private(),
   },
});
