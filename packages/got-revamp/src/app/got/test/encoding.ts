import { Buffer } from "buffer";
import test from "ava";
import withServer from "./helpers/with-server.js";
import TSON from "typescript-json";

test("encoding works with json", withServer, async (t, server, got) => {
	const json = { data: "é" };

	server.get("/", (_request, response) => {
		response.set("Content-Type", "application-json");
		response.send(Buffer.from(TSON.stringify<T>(json), "latin1"));
	});

	const response = await got("", {
		encoding: "latin1",
		responseType: "json"
	});

	t.deepEqual(response.body, json);
});
