import { Hono } from 'hono';
import OpenAI from 'openai';

const app = new Hono<{ Bindings: Env }>();

type ImageUpload = {
	caption: string,
	imageUrl: string
}

app.post("/api/process-image", async(c) => {
	const payload: ImageUpload = await c.req.json();
	const client = new OpenAI({
		apiKey: c.env.OPENAI_API_KEY
	});
	const response = await client.responses.create({
		model: "gpt-4.1",
		instructions: "The user is going to provide you with an image and a potential caption. Extract requested information from it",
		input: [{
			role: "user",
			content: [
				{type: "input_text", text: payload.caption},
				{type: "input_image", image_url: payload.imageUrl, detail: "auto"},
			]
		}],
		text: {
			format: {
				type: "json_schema",
				name: "photo_location",
				schema: {
					type: "object",
					properties: {
						briefExplanation: {
							type: "string",
							description: "A brief explanation of the potential location and the reason it was assumed"
						},
						location: {
							type: "string",
							description: "The closest assumed location in the format of City, State, Country. eg: Los Angeles, California, USA"
						},
						latitude: {
							type: "number",
							description: "Latitude where this photo was taken"
						},
						longitude: {
							type: "number",
							description: "Longitude where this photo was taken"
						}
					},
					required: ["briefExplanation", "location", "latitude", "longitude"],
					additionalProperties: false,
				},
			},
		}
	})
	const photoLocation = JSON.parse(response.output_text);
	return c.json(photoLocation);
});


export default app;
