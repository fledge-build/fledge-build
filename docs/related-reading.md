# Related reading

External writing that validates or informs Fledge's strategy.

## Encoding Team Standards

**Martin Fowler** (martinfowler.com)
https://martinfowler.com/articles/reduce-friction-ai/encoding-team-standards.html

Argues that AI-assisted development creates a consistency problem: output quality varies based on who is prompting. The solution is encoding team standards as versioned, executable instructions in repositories, treating them as shared infrastructure rather than personal prompting skill. The article's framing of "the governance is the workflow" (standards apply automatically through normal development, not as a separate enforcement step) aligns directly with Fledge's auto-selected skills model.

Fledge builds on the same thesis with a more structured approach:

- **Technology-scoped skills** instead of generic instruction sets, producing more concrete guidance
- **Decision trees** over categorized rule lists, mirroring how experienced engineers think through problems
- **The what/how split**, structuring the full development process (brief, enrich, build) rather than only the code generation step
- **Project knowledge as a maintained system**, not just context provided to instructions
- **Distribution as packages** with progressive adoption, so teams get a strong starting point without building from scratch
