function assertEnvVarExists(
	value: unknown,
	variableName: string
): asserts value is string {
	if (typeof value !== "string" || value === null || value === undefined) {
		throw new Error(`Environment variable "${variableName}" is not a string.`);
	}
}

// Define the expected structure of the Commit information.
export type Commit = {
	repo: string;
	hash: string;
	branch: string;
};

/** Returns the commit info for this build
 *
 * @returns {Promise<Commit>}
 */
export async function getCommitInfo(): Promise<Commit> {
	// NOTE: This uses the environment variables populated
	// by vercel, so if we were to switch providers we need to update this.
	console.log(
		"Vercel environment detected. Extracting variables for commit info..."
	);
	// Assert each required environment variable is a string.
	assertEnvVarExists(process.env.GIT_REPO_NAME, "GIT_REPO_NAME");
	assertEnvVarExists(process.env.GIT_COMMIT_SHA, "GIT_COMMIT_SHA");
	assertEnvVarExists(process.env.GIT_COMMIT_BRANCH, "GIT_COMMIT_BRANCH");

	// If all checks pass, return the object.
	return {
		repo: process.env.GIT_REPO_NAME,
		hash: process.env.GIT_COMMIT_SHA,
		branch: process.env.GIT_COMMIT_BRANCH
	};
}

export type BuildInfo = {
	commitInfo: Commit;
	buildTimestamp: string;
};

export async function getBuildInfo(): Promise<BuildInfo> {
	return {
		commitInfo: await getCommitInfo(),
		buildTimestamp: new Date().toISOString()
	};
}
