const assert = require("assert");
const Ganache = require("ganache-core");
const Provider = require("../index");
const Web3HttpProvider = require("web3-providers-http");

describe("Provider", function() {
  let server;
  const port = 12345;
  const host = "127.0.0.1";

  before("Initialize Ganache server", done => {
    server = Ganache.server({});
    server.listen(port, function(err) {
      assert.ifError(err);
      done();
    });
  });

  after("Shutdown Ganache", done => {
    server.close(done);
  });

  it("accepts host and port", async () => {
    const provider = Provider.create({ host, port });
    assert(provider);

    try {
      await Provider.testConnection({ provider });
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it("accepts url", async () => {
    const provider = Provider.create({ url: `http://${host}:${port}` });
    assert(provider);

    try {
      await Provider.testConnection({ provider });
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it("accepts uses url before host/port", async () => {
    const provider = Provider.create({
      url: `http://${host}:${port}`,
      host: "invalidhost",
      port: 42
    });
    assert(provider);

    try {
      await Provider.testConnection({ provider });
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it("fails to connect to the wrong port", async () => {
    const provider = Provider.create({ host, port: "54321" });

    try {
      await Provider.testConnection({ provider });
      assert(false);
    } catch (error) {
      const snippet = `Could not connect to your Ethereum client`;
      if (error.message.includes(snippet)) {
        assert(true);
      } else {
        assert.fail("There was an error testing the provider.");
      }
    }
  });

  it("accepts a provider instance", async () => {
    const provider = Provider.create({
      provider: new Ganache.provider()
    });
    try {
      await Provider.testConnection({ provider });
      assert(provider);
    } catch (error) {
      assert.fail("There was an error testing the provider.");
    }
  });

  it("accepts a function that returns a provider instance", async () => {
    const provider = Provider.create({
      provider: function() {
        return new Ganache.provider();
      }
    });
    try {
      await Provider.testConnection({ provider });
      assert(provider);
    } catch (error) {
      assert.fail("There was an error testing the provider.");
    }
  });

  it("fails when given a bogus provider url", async () => {
    const provider = Provider.create({
      provider: new Web3HttpProvider("http://127.0.0.1:9999")
    });

    try {
      await Provider.testConnection({ provider });
      assert.fail(
        "The provider was instantiated correctly. That shouldn't have happened"
      );
    } catch (error) {
      const snippet = `Could not connect to your Ethereum client`;
      if (error.message.includes(snippet)) {
        assert(true);
      } else {
        assert.fail(`While testing the provider, got an error - ${error}.`);
      }
    }
  });
});
