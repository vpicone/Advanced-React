Steps to add types:
1. Add to datamodel.grapql
2. Deploy to prisma which brings down new prisma.graphql
3. Go into our own schema.graphql (public facing UI) and declare mutations/queries
4. Add resolver logic to the mutation and query logic