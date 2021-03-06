const http = require("http");
const { app } = require("../index.js");
const server = http.createServer(app);
const request = require("supertest");
const { client } = require("../shared/redis-client.js");
const { ACCESS_TOKEN_SECRET } = require("../shared/constants.js");
const { truncTables, insertRows } = require("./config/db-setup.js");
const { fetchProductData } = require("../fetch/fetch-products.js");
const {
  beaniesInsert,
  ippalRes,
  juuranRes,
  abiplosRes,
} = require("./data/crud-data.js");
const {
  beaniesRes,
  facemasksRes,
  glovesRes,
  beaniesRedisRes,
  facemasksRedisRes,
  glovesRedisRes,
} = require("./data/product-data.js");

server.listen(3020);

beforeAll(async () => {
  await truncTables();
  await insertRows();
});

afterAll(async () => {
  await client.quit();
  await server.close();
  await new Promise((resolve) => setTimeout(() => resolve(), 500)); // Avoid jest open handle error
});

describe("GET product data should fail", () => {
  test("Request with no token", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-VERSION": "v2",
        "X-PRODUCT": "beanies",
      })
      .expect(401)
      .expect("Proper authorization credentials were not provided.");
    done();
  });
  test("Request with the wrong token", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": "Squirrel1",
        "X-VERSION": "v2",
        "X-PRODUCT": "beanies",
      })
      .expect(403)
      .expect("Invalid authentication credentials.");
    done();
  });
  test("Right credentials, nonexistent product", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": ACCESS_TOKEN_SECRET,
        "X-VERSION": "v2",
        "X-PRODUCT": "tophats",
      })
      .expect(404)
      .expect("The requested product tophats does not exist.");
    done();
  });
});

describe("GET product data should succeed", () => {
  test("Request beanies product data succeeds", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": ACCESS_TOKEN_SECRET,
        "X-VERSION": "v2",
        "X-PRODUCT": "beanies",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(beaniesRes);
    done();
  });

  test("Requesting beanies again gives a res from Redis", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": ACCESS_TOKEN_SECRET,
        "X-VERSION": "v2",
        "X-PRODUCT": "beanies",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(beaniesRedisRes);
    done();
  });

  test("Request facemasks product data succeeds", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": ACCESS_TOKEN_SECRET,
        "X-VERSION": "v2",
        "X-PRODUCT": "facemasks",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(facemasksRes);
    done();
  });

  test("Requesting facemasks again gives a res from Redis", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": ACCESS_TOKEN_SECRET,
        "X-VERSION": "v2",
        "X-PRODUCT": "facemasks",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(facemasksRedisRes);
    done();
  });

  test("Request gloves product data succeeds", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": ACCESS_TOKEN_SECRET,
        "X-VERSION": "v2",
        "X-PRODUCT": "gloves",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(glovesRes);
    done();
  });

  test("Requesting gloves again gives a res from Redis", async (done) => {
    await request(app)
      .get("/")
      .set({
        "X-WEB-TOKEN": ACCESS_TOKEN_SECRET,
        "X-VERSION": "v2",
        "X-PRODUCT": "gloves",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(glovesRedisRes);
    done();
  });
});

describe("DB actions should succeed", () => {
  fetchMock.mockResponses(
    [JSON.stringify([beaniesInsert]), { status: 200 }],
    [JSON.stringify([ippalRes])],
    [JSON.stringify([juuranRes])],
    [JSON.stringify([abiplosRes])]
  );

  test("INSERT beanies data", async () => {
    try {
      fetchProductData("beanies");  // << This is not recognized :(
    } catch (err) {
      console.log(err);
    }
  });
});
