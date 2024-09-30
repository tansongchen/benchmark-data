CREATE TABLE IF NOT EXISTS benchmark (
	'commit' TEXT PRIMARY KEY,
    'datetime' TEXT NOT NULL,
    'name' TEXT NOT NULL,
    'branch' TEXT NOT NULL,
    'tag' TEXT,
	'config' TEXT NOT NULL,
    'result' TEXT NOT NULL
);
