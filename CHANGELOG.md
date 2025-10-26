# Changelog

All notable changes to promptx will be documented in this file.

## [3.7.0] - 2025-10-26 - PRO MODE WITH PROJECT CONTEXT 🚀

### Added
- 🚀 **Pro Mode** - Revolutionary `--pro` flag for full project context awareness
- 📁 **Automatic File Scanning** - Recursively scans all project files in current directory
- 🔒 **Security Confirmation** - Requires user confirmation before sending files to AI
- 📊 **Smart File Filtering** - Ignores node_modules, .git, build files, and other unnecessary folders
- 📝 **Context-Aware Prompts** - AI generates highly specific prompts tailored to your exact codebase
- 🎯 **Intelligent Extensions** - Supports 30+ file types (JS, TS, Python, Java, Go, and more)
- 📦 **Size Limits** - Automatically skips files over 100KB to prevent token overload
- 🌈 **Beautiful UI** - Shows file list, total characters, and progress spinners

### Changed
- 📊 **Enhanced System Prompt** - AI now understands project structure when in Pro mode
- 🎨 **Improved Help Menu** - Added Pro mode documentation and usage examples
- 🔄 **All Providers Supported** - Pro mode works with OpenAI, Anthropic, xAI, and Google models

### Technical Details
- Adds project context as JSON to AI messages with file paths and contents
- Respects common ignore patterns (.env, .log, lock files)
- Validates file extensions before reading
- Shows file preview (first 10 files) before confirmation
- Displays total character count for transparency

### Benefits for Users
- 🎯 **Hyper-Specific Prompts** - AI references actual files, functions, and code structure
- ⚡ **Saves Time** - No need to manually copy-paste code context
- 🔐 **Safe** - Requires explicit confirmation with warning about sensitive data
- 📈 **Better Results** - More accurate and contextual prompt refinements

## [3.6.0] - 2025-10-26 - LATEST MODELS WITH BENCHMARKS 📊

### Added
- 🤖 **GPT-5 Family** - Latest OpenAI models with GPT-5, GPT-5 Mini, and GPT-5 Nano
- 🧠 **Claude 4.5 Family** - Sonnet 4.5 (frontier coding), Haiku 4.5 (fastest), Opus 4.1 (deepest reasoning)
- 🚀 **Grok 4 Fast** - New xAI models with 2M context and specialized coding model
- 🌟 **Gemini 2.5 Family** - Latest Google models with 1M context windows
- 📊 **Benchmark-Based Descriptions** - All models now rated by actual SWE-bench Verified scores

### Changed
- 🏆 **Performance Data** - GPT-5 leads with 74.9% coding score, Claude Opus 4.1 at 74.5%
- ⚡ **Speed Metrics** - Real latency data: GPT-5 Nano (3s), Mini (4.5s), Base (10s)
- 💰 **Cost Transparency** - Accurate pricing for all models from official sources
- 📦 **Context Windows** - Grok 4 Fast (2M), Gemini/Claude (1M), GPT-5 (400K)
- 🧠 **Reasoning Support** - Marked models with extended thinking capabilities

### Documentation
- 📚 **Complete README Overhaul** - Detailed benchmark data for 12 models across 4 providers
- 🎯 **Quick Selection Guide** - Compare models by coding ability, speed, cost, and context
- 📈 **Release Dates** - Added official release dates for all models
- 🔍 **Technical Details** - Token limits, throughput, and feature capabilities

### Technical Details
- Updated all model API identifiers to latest versions
- Added benchmark scores from official announcements (Aug-Oct 2025)
- Included latency measurements and throughput data
- Updated reasoning/thinking model flags based on official capabilities
- Comprehensive model comparison tables with real performance metrics

### User Benefits
- ✅ Make data-driven model selection decisions
- ✅ Understand true performance vs marketing claims
- ✅ Choose right model for specific use cases (coding, reasoning, speed, cost)
- ✅ Access latest cutting-edge AI models

## [3.5.3] - 2025-08-06 - PERSISTENT QUALITY RECOMMENDATIONS 💡

### Added
- 🎯 **Always-Visible Quality Guidance** - Model recommendation message appears every time user selects Ollama
- 💡 **Proactive User Education** - Clear 7B+ parameter recommendation before model selection
- 🔄 **Consistent Experience** - Same guidance in both setup wizard and `/model` command flows
- ⚠️ **Quality Warnings** - Persistent reminder about smaller models producing poor results

### Enhanced
- 📋 **Model Selection UX** - Users now see quality guidance before choosing any Ollama model
- 🎨 **Strategic Positioning** - Recommendation appears right before model selection prompt
- 💬 **Clear Messaging** - Specific model recommendations with parameter counts
- 🚀 **User Success** - Helps users make informed decisions every time

### Technical Details
- Added quality message in `setupWizard()` after successful Ollama model discovery
- Added quality message in `changeModel()` after successful Ollama model discovery
- Message appears before model selection prompt for maximum visibility
- Maintains clean UI while providing essential quality guidance

## [3.5.2] - 2025-08-06 - MODEL QUALITY GUIDANCE 📋

### Improved
- 🎯 **Model Size Guidance** - Added important warnings about small models (<7B) producing poor results
- 📊 **Quality Recommendations** - Emphasized 7B+ models (llama3, mistral, codellama) for best prompt refinement
- 💡 **User Education** - Clear parameter counts and quality expectations across all error scenarios
- 🔍 **Consistent Messaging** - Updated all Ollama error messages with model size recommendations

### Technical Details
- Updated `showOllamaNoModelsError()` with 7B+ model recommendations
- Enhanced model not found errors with quality alternatives
- Improved memory error guidance with size vs quality trade-offs
- Added README note about 7B+ parameter requirement for optimal results

### User Benefits
- Prevents downloading poor-performing small models
- Sets proper expectations for model quality vs size
- Provides specific, actionable model recommendations
- Helps users make informed decisions about local model selection

## [3.5.1] - 2025-08-06 - UI IMPROVEMENTS 🎨

### Improved
- 🎨 **Cleaner Ollama UI** - Removed scanning messages for streamlined model selection
- ✨ **Consistent Experience** - Ollama model selection now matches other providers
- 🚀 **Faster Workflow** - Direct model selection without extra status messages

### Technical Details
- Removed "Scanning for local Ollama models..." message
- Removed "✅ Found X local model(s)" success message
- Users now see model choices directly in the selection prompt
- Maintains all error handling and guidance for failure scenarios

## [3.5.0] - 2025-08-06 - OLLAMA INTEGRATION 🦙

### Added
- 🦙 **Ollama Provider Support** - Full integration with local Ollama models
- 🔍 **Automatic Model Discovery** - Scans and displays locally downloaded Ollama models
- 🛡️ **Comprehensive Error Handling** - Graceful fallbacks for all Ollama failure scenarios
- 📋 **Smart Error Detection** - Specific guidance for installation, service, and model issues
- 🔄 **Graceful Degradation** - Seamless fallback to cloud providers when Ollama fails
- 💡 **User Guidance System** - Actionable instructions for each error scenario

### Enhanced
- 🚀 **Setup Wizard** - Now includes Ollama as a provider option with error handling
- 🔧 **Model Selection** - Dynamic discovery and selection of local Ollama models
- 🌐 **API Integration** - OpenAI-compatible API support for Ollama models
- ⚡ **Streaming Support** - Real-time streaming for Ollama model responses
- 🎯 **Error Messages** - Specific, helpful error messages with exact commands to fix issues

### Technical Details
- Added `discoverOllamaModels()` function with comprehensive error detection
- Implemented `checkOllamaService()` for service status verification
- Enhanced setupWizard and changeModel functions with Ollama error handling
- Added specific error guidance functions for each failure scenario
- Integrated Ollama into existing provider selection and configuration system
- Maintained consistency with existing error handling patterns

### Error Scenarios Covered
- **Ollama Not Installed** → Installation instructions with links to https://ollama.ai
- **Service Not Running** → Commands to start Ollama service (`ollama serve`)
- **No Models Downloaded** → Popular model suggestions (`ollama pull llama3`, etc.)
- **API Connection Failures** → Troubleshooting steps and port checking
- **Model Execution Errors** → Memory optimization and model guidance
- **Unknown Errors** → Generic troubleshooting with fallback options

## [3.4.8] - 2025-08-03 - STABLE RELEASE 🎉

### Changed
- 🎨 Removed ASCII banner for cleaner look
- ✨ Simplified "What's New" section to be more concise and appealing
- 📊 Focused on key features with bold highlights
- 🚀 More impactful feature presentation

### Technical Details
- Removed ASCII art logo as requested
- Condensed the feature list to 5 key highlights
- Used bold text for emphasis on important features
- Made the version section shorter and more scannable

## [3.4.7] - 2025-08-03 - STABLE RELEASE 🎉

### Added
- 🎨 ASCII art promptx logo at the top of README
- 📊 Enhanced formatting with tables for commands and API keys
- ✨ Visual before/after transformation example
- 🎯 Better structured sections with emojis
- 💫 Centered header with badges
- 🔗 Footer with links to GitHub, issues, and author

### Changed
- 📐 Improved overall README layout and visual appeal
- 🛠️ Enhanced troubleshooting section with common issues table
- 💻 Better formatted usage section with clear subsections
- 📋 Requirements section now uses a table format

### Technical Details
- ASCII logo prominently displayed at the top
- Centered title and badges for professional look
- Side-by-side transformation example using HTML table
- Consistent emoji usage throughout for visual hierarchy
- Added footer with action links

## [3.4.6] - 2025-08-03 - STABLE RELEASE 🎉

### Changed
- 🔄 Reverted README to previous format per user request
- 📚 Restored the original README structure from v3.4.3
- 🔧 Updated version references to v3.4.5

### Technical Details
- README now uses the previous format that was preferred
- Version numbers in README updated to reflect current stable release

## [3.4.5] - 2025-08-03 - STABLE RELEASE 🎉

### Changed
- 🚨 Added prominent global install command at the top of README
- ⚠️ Added warning to use -g flag and not npm's suggested command
- 📐 Restructured README to be more space-efficient
- 🔄 Moved detailed example to collapsible section at the bottom
- ✨ Simplified "What is promptx?" section

### Technical Details
- Install command now appears immediately after title
- Clear warning about global installation requirement
- Example transformation now in expandable details section
- More concise introduction section

## [3.4.4] - 2025-08-03 - STABLE RELEASE

### Changed
- 📚 Completely redesigned README with modern structure
- ✨ Added comprehensive documentation with tables and examples
- 🎨 Better organization with clear sections and navigation
- 📖 Added detailed troubleshooting guide
- 🏗️ Professional presentation with badges and formatting

### Added
- 📊 Model comparison tables with types (Standard/Thinking)
- 🔍 Before/after prompt transformation example
- 💡 Common issues and solutions section
- 🔗 Direct links to sections for easy navigation
- 🎯 Clear feature categorization

## [3.4.3] - 2025-08-03 - STABLE RELEASE

### Changed
- 🔧 Removed npm version from system prompt for easier maintenance
- 🚫 Removed Grok 4 Heavy (not available via public API)

### Technical Details
- System prompt no longer contains hardcoded version number
- Removed Grok 4 Heavy from all model lists and documentation
- Only Grok 3, Grok 3 Mini, and Grok 4 are available via xAI API

## [3.4.2] - 2025-08-03 - STABLE RELEASE

### Changed
- 🎯 Completely redesigned system prompt for better prompt engineering
- 🤖 Added conversational handling for casual interactions
- 📝 Enhanced prompt engineering principles with 5 comprehensive categories
- ✨ Added advanced prompt techniques for complex logic
- 🏷️ System prompt now identifies as promptx with creator attribution

### Technical Details
- New system prompt includes:
  - Critical behavior rules for conversational vs prompt requests
  - Ultra-specific objectives guidelines
  - Comprehensive technical requirements structure
  - Implementation guidelines framework
  - AI-optimized structure principles
  - Advanced prompt techniques
- Better handling of edge cases and user intent detection

## [3.4.1] - 2025-08-03 - STABLE RELEASE

### Changed
- 🤔 Marked Gemini 2.5 Pro as a thinking model
- ⏳ Added thinking spinner for Gemini 2.5 Pro
- 📝 Updated model description to indicate thinking capability

### Technical Details
- Added isThinkingModel flag to Gemini 2.5 Pro configuration
- Thinking spinner appears for Gemini 2.5 Pro until first streaming chunk

## [3.4.0] - 2025-08-03 - STABLE RELEASE

### Added
- 🌟 Google AI support with Gemini models
- 🚀 Gemini 2.5 Flash - Fast and efficient model
- 🚀 Gemini 2.0 Flash - Previous flash version
- 🚀 Gemini 2.5 Pro - Most capable Gemini model
- 🔑 Google AI API key setup and validation
- 🎯 Full streaming support for Google models

### Changed
- 📦 Added @google/generative-ai dependency
- 🤖 Now supports 4 AI providers: OpenAI, Anthropic, xAI, and Google
- 📚 Updated documentation to include Google setup

### Technical Details
- Google AI SDK integration using @google/generative-ai
- Streaming implemented using generateContentStream
- System and user prompts combined for Google's single-prompt format

## [3.3.0] - 2025-08-03 - STABLE RELEASE

### Added
- 🚀 GPT-4.1 model support (replaces O3)
- 🤔 Thinking spinner for thinking models (O4 Mini, Grok 4, Grok 4 Heavy)
- ⏳ Shows "Thinking..." while models process before streaming

### Changed
- 🔄 Replaced O3 model with GPT-4.1
- 📝 Updated model descriptions to indicate thinking models
- 🎯 Marked O4 Mini, Grok 4, and Grok 4 Heavy as thinking models

### Technical Details
- Added isThinkingModel flag to model configurations
- Thinking spinner appears until first streaming chunk arrives
- Improved user experience for models with longer initial processing times

## [3.2.4] - 2025-08-03 - STABLE RELEASE

### Fixed
- 🐛 Fixed O4 Mini and O3 temperature parameter error
- ✅ These models now use default temperature value only

### Technical Details
- O4 Mini and O3 models don't support custom temperature values
- Temperature parameter is now only set for GPT-4o model
- Prevents "Unsupported value: 'temperature'" errors

## [3.2.3] - 2025-08-03 - STABLE RELEASE

### Added
- 📐 Proper word wrapping for streaming output
- 🖼️ Respects terminal width boundaries
- 📦 Added wrap-ansi dependency for better text formatting

### Technical Details
- Streaming output now wraps at terminal boundaries with proper margins
- Prevents text from running to the edge of the terminal
- Handles word breaks intelligently to maintain readability
- Buffer-based approach ensures smooth streaming experience

## [3.2.2] - 2025-08-03 - STABLE RELEASE

### Added
- 🚀 Real-time streaming output to terminal
- ✨ See refined prompts as they are generated
- 🎯 Immediate visual feedback during prompt refinement

### Technical Details
- Removed loading spinner once streaming starts
- Output streams directly to terminal using process.stdout.write
- Consistent formatting across all providers

## [3.2.1] - 2025-08-03 - STABLE RELEASE

### Fixed
- 🐛 Fixed API streaming errors for long operations across all providers
- ✅ Added proper streaming support for all models to prevent timeout errors

### Enhanced
- 🚀 Enabled streaming for OpenAI models (GPT-4o, O4 Mini, O3)
- 🚀 Enabled streaming for Anthropic models (Claude Opus 4, Sonnet 4)
- 🚀 Enabled streaming for xAI models (Grok 3, Grok 4)

### Technical Details
- All API calls now use `stream: true` parameter
- Properly handles streaming response chunks for reliable operation
- Prevents timeout errors for long-running prompt refinements

## [3.2.0] - 2025-08-03 - STABLE RELEASE

This is the **official stable release** of promptx! This version contains all the essential features and bug fixes for production use.

### What's Included
- ✅ **Complete multi-provider support**: OpenAI, Anthropic, and xAI
- ✅ **All API compatibility issues resolved**: 
  - O4 Mini and O3 models use correct `max_completion_tokens` parameter
  - Claude 4 models use proper identifiers (`claude-opus-4`, `claude-sonnet-4`)
  - Grok 4 reasoning models have correct API parameters
- ✅ **Stable, tested codebase** with no experimental features
- ✅ **Complete feature set**: Interactive wizard, model switching, help system

### Why Upgrade?
- 🔒 **Production ready**: No more beta features or experimental code
- 🐛 **Bug-free**: All known API compatibility issues resolved
- 🚀 **Performance**: Optimized for reliability and speed
- 📚 **Complete documentation**: Full help system and clear usage instructions

**Upgrade command:**
```bash
npm install -g @lukaloehr/promptx@latest
```

## [1.3.1] - 2025-08-02

### Fixed
- 🐛 Fixed O4 Mini and O3 API errors by using `max_completion_tokens` parameter
- 🔧 Fixed Claude 4 model identifiers (`claude-opus-4`, `claude-sonnet-4`)
- 🎯 Updated Grok 4 API parameters (reasoning models don't support temperature)
- 📝 Corrected model descriptions based on latest API documentation

### Changed
- Claude Opus 4 now correctly uses 32k max tokens, Sonnet 4 uses 64k
- Grok 4 models now properly configured as reasoning models
- O4 Mini and O3 use max_completion_tokens instead of max_tokens

## [1.3.0] - 2025-08-02 - Stable Release 🎉

### Added
- 📚 `/help` command for quick reference and command overview
- 🎯 Complete feature documentation in help menu
- 📝 Comprehensive update history in `/whats-new`
- 🔧 Enhanced package configuration with explicit file lists
- 📦 `.npmignore` for cleaner npm packages
- 🔑 Updated `.env.example` with all provider formats

### Changed
- 🌟 `/whats-new` now shows complete feature history for stable release
- 📋 Improved package metadata and keywords
- 🎨 Better organized command documentation

## [1.2.1] - 2025-08-02

### Added
- 🔔 Automatic update notifications when new versions are available
- 📦 Shows update command in notification: `npm install -g @lukaloehr/promptx`
- ⏰ Update check runs once per day to avoid being intrusive

## [1.2.0] - 2025-08-02

### Added
- 🚀 xAI Grok support: Grok 3, Grok 3 Mini, Grok 4, Grok 4 Heavy
- 🧠 Updated Claude models: Sonnet 4 and Opus 4
- 🤖 Updated OpenAI models: O4 Mini and O3
- 📁 Organized model selection by provider for better UX
- 🎯 Provider-first selection in setup wizard

### Changed
- Models are now grouped by provider in the selection menu
- Improved model descriptions with performance indicators
- Updated API key validation for xAI

## [1.1.0] - 2025-08-02

### Added
- 🤖 Multi-model support: Choose between multiple AI providers
  - OpenAI: GPT-4o, GPT-4o Mini, O3
  - Anthropic: Claude 3.5 Sonnet, Claude 3 Opus
- 🔄 `/model` command: Switch between models on the fly
- ✨ Modern setup wizard: Interactive model and API key configuration
- 📰 `/whats-new` command: See latest updates and features
- 🔑 Support for both OpenAI and Anthropic API keys

### Changed
- Improved first-run experience with guided setup
- Configuration now supports multiple API providers

## [1.0.2] - 2025-08-02

### Added
- 📦 NPM badges in README
- ⚠️ Post-install warning for local installations

### Changed
- Improved installation instructions with emphasis on global installation
- Simplified README structure

## [1.0.1] - 2025-08-02

### Fixed
- Package.json formatting issues
- Installation command documentation

## [1.0.0] - 2025-08-02

### Added
- 🎉 Initial release
- ✨ Transform messy prompts into structured, clear prompts
- 🎨 Beautiful CLI interface with colors and spinners
- 📦 Global npm package with easy installation
- 🔐 Secure API key storage
- 💻 Interactive and direct command-line modes
- 🤖 GPT-4o support for prompt refinement

### Features
- Simple one-command global installation
- First-time setup wizard for API key
- Beautiful colored output
- Loading spinners for better UX
- Error handling with helpful messages
- Command to reset API key