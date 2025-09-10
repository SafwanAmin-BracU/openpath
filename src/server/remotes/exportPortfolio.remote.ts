import { Octokit } from "octokit";
import { TrackContributionsService } from "~/server/app/portfolio";
import PDFDocument from "pdfkit";

export interface ExportPortfolioRequest {
  userId: string;
  format: "pdf" | "linkedin";
}

export interface ExportPortfolioResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Export portfolio data in various formats
 */
export async function exportPortfolio(
  request: ExportPortfolioRequest,
  octokit: Octokit
): Promise<ExportPortfolioResponse> {
  try {
    const { userId, format } = request;

    // Get portfolio service
    const portfolioService = new TrackContributionsService(octokit);

    // Get comprehensive portfolio data
    const portfolio = await portfolioService.getContributionPortfolio(userId);
    const impactMetrics = await portfolioService.getImpactMetrics(userId);
    const dashboardData = await portfolioService.getDashboardData(userId);

    if (format === "pdf") {
      return await generatePDF(portfolio, impactMetrics, dashboardData);
    } else if (format === "linkedin") {
      return await generateLinkedInSnippet(portfolio, impactMetrics, dashboardData);
    } else {
      return {
        success: false,
        error: "Unsupported export format",
      };
    }
  } catch (error) {
    console.error("Error exporting portfolio:", error);
    return {
      success: false,
      error: "Failed to export portfolio",
    };
  }
}

/**
 * Generate PDF portfolio export
 */
async function generatePDF(
  portfolio: any,
  impactMetrics: any,
  dashboardData: any
): Promise<ExportPortfolioResponse> {
  return new Promise((resolve) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks as any);
        const base64PDF = pdfBuffer.toString("base64");

        resolve({
          success: true,
          data: base64PDF,
        });
      });

      // Header
      doc.fontSize(24).font("Helvetica-Bold").text("Open Source Portfolio", { align: "center" });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).font("Helvetica-Bold").text("Summary");
      doc.moveDown();
      doc.fontSize(12).font("Helvetica");
      doc.text(`Total Contributions: ${impactMetrics.overall.totalContributions}`);
      doc.text(`Lines of Code: ${impactMetrics.overall.totalAdditions.toLocaleString()}`);
      doc.text(`Issues Resolved: ${impactMetrics.overall.resolvedIssues}`);
      doc.text(`Repositories Contributed: ${impactMetrics.overall.repositoriesContributed}`);
      doc.moveDown(2);

      // Top Skills
      doc.fontSize(16).font("Helvetica-Bold").text("Top Skills");
      doc.moveDown();
      doc.fontSize(12).font("Helvetica");
      dashboardData.skills.slice(0, 10).forEach((skill: any, index: number) => {
        doc.text(`${index + 1}. ${skill.name} (${skill.category}) - ${skill.totalLines.toLocaleString()} lines, ${skill.prCount} PRs`);
      });
      doc.moveDown(2);

      // Top Projects
      doc.fontSize(16).font("Helvetica-Bold").text("Top Projects");
      doc.moveDown();
      doc.fontSize(12).font("Helvetica");
      dashboardData.projects.slice(0, 5).forEach((project: any, index: number) => {
        doc.text(`${index + 1}. ${project.repoOwner}/${project.repoName}`);
        doc.text(`   - ${project.prCount} PRs, ${project.totalLines.toLocaleString()} lines changed`);
        doc.text(`   - Last contribution: ${project.lastContribution.toLocaleDateString()}`);
        doc.moveDown();
      });
      doc.moveDown(2);

      // Recent Contributions
      doc.fontSize(16).font("Helvetica-Bold").text("Recent Contributions");
      doc.moveDown();
      doc.fontSize(10).font("Helvetica");
      portfolio.contributions.slice(0, 10).forEach((contribution: any) => {
        doc.text(`• ${contribution.title}`);
        doc.text(`  ${contribution.repositoryOwner}/${contribution.repositoryName} - ${contribution.mergedAt.toLocaleDateString()}`);
        doc.text(`  +${contribution.additions} -${contribution.deletions} lines`);
        doc.moveDown();
      });

      // Footer
      doc.fontSize(8).font("Helvetica").text(
        `Generated on ${new Date().toLocaleDateString()} | OpenPath Platform`,
        50,
        doc.page.height - 50,
        { align: "center" }
      );

      doc.end();
    } catch (error) {
      resolve({
        success: false,
        error: "Failed to generate PDF",
      });
    }
  });
}

/**
 * Generate LinkedIn snippet for portfolio
 */
async function generateLinkedInSnippet(
  portfolio: any,
  impactMetrics: any,
  dashboardData: any
): Promise<ExportPortfolioResponse> {
  try {
    const topSkills = dashboardData.skills.slice(0, 5).map((s: any) => s.name).join(", ");
    const topProjects = dashboardData.projects.slice(0, 3).map((p: any) => `${p.repoOwner}/${p.repoName}`).join(", ");

    const linkedinSnippet = `# Open Source Contributions

## Summary
I've made ${impactMetrics.overall.totalContributions} contributions to open source projects, writing ${impactMetrics.overall.totalAdditions.toLocaleString()} lines of code and resolving ${impactMetrics.overall.resolvedIssues} issues across ${impactMetrics.overall.repositoriesContributed} repositories.

## Key Skills
${topSkills}

## Notable Projects
${topProjects}

## Recent Activity
${portfolio.contributions.slice(0, 3).map((c: any) => `- ${c.title} in ${c.repositoryOwner}/${c.repositoryName}`).join('\n')}

## Impact Metrics
- Total Lines of Code: ${impactMetrics.overall.totalAdditions.toLocaleString()}
- Issues Resolved: ${impactMetrics.overall.resolvedIssues}
- Repositories Contributed: ${impactMetrics.overall.repositoriesContributed}
- Languages Used: ${impactMetrics.overall.languagesUsed}

#OpenSource #SoftwareDevelopment #${dashboardData.skills.slice(0, 3).map((s: any) => s.name.replace(/\s+/g, '')).join(' #')}

---
*Portfolio generated via OpenPath platform*`;

    return {
      success: true,
      data: linkedinSnippet,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to generate LinkedIn snippet",
    };
  }
}
