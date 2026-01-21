#!/usr/bin/env node
import { config } from 'dotenv';
import { program } from 'commander';
import { predictCommand } from './commands/predict';
import { scoreCommand } from './commands/score';

// Load environment variables from .env.local
config({ path: '.env.local' });

program
	.name('wc-ai-battle')
	.description('CLI for 2026 World Cup AI Battle predictions')
	.version('0.1.0');

program
	.command('predict')
	.description('Run AI predictions for matches')
	.option('-p, --phase <phase>', 'Match phase (groups, round-of-16, etc.)', 'groups')
	.option('-m, --model <model>', 'Specific model to run')
	.option('--dry-run', 'Preview without making actual API calls')
	.option('--gateway', 'Use Vercel AI Gateway instead of direct provider calls')
	.option('--direct', 'Use direct provider calls (default if no AI_GATEWAY_API_KEY)')
	.action((options) => {
		// Determine gateway usage: explicit flag > env var
		if (options.gateway) {
			options.useGateway = true;
		} else if (options.direct) {
			options.useGateway = false;
		}
		// If neither flag, predictCommand will check AI_GATEWAY_API_KEY
		return predictCommand(options);
	});

program
	.command('score')
	.description('Calculate scores for all models')
	.option('-m, --model <model>', 'Calculate score for specific model')
	.option('--verbose', 'Show detailed breakdown')
	.action(scoreCommand);

program
	.command('report')
	.description('Generate a report of current standings')
	.option('-o, --output <format>', 'Output format (json, md, csv)', 'md')
	.action(async (options) => {
		console.log('Generating report in', options.output, 'format...');
		// TODO: Implement report generation
	});

program.parse();
