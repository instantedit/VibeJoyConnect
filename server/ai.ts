import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function calculateJobMatch(
  jobSkills: string[],
  jobDescription: string,
  freelancerSkills: string[],
  freelancerExperience: string,
  freelancerBio: string
): Promise<{ score: number; reasoning: string }> {
  try {
    const prompt = `
      Analyze the compatibility between a job and freelancer profile. Return a match score and reasoning.
      
      Job Details:
      - Required Skills: ${jobSkills.join(", ")}
      - Description: ${jobDescription}
      
      Freelancer Profile:
      - Skills: ${freelancerSkills.join(", ")}
      - Experience: ${freelancerExperience}
      - Bio: ${freelancerBio}
      
      Calculate a match score from 0-100 and provide brief reasoning. Return JSON in this format:
      { "score": number, "reasoning": "brief explanation of the match quality" }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an AI job matching expert. Analyze skill compatibility, experience relevance, and cultural fit. Be precise with scoring."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      score: Math.max(0, Math.min(100, Math.round(result.score))),
      reasoning: result.reasoning || "Match analysis completed"
    };
  } catch (error) {
    console.error("AI matching error:", error);
    return {
      score: 0,
      reasoning: "Unable to calculate match score"
    };
  }
}

export async function enhanceJobDescription(
  title: string,
  description: string,
  skills: string[],
  category: string
): Promise<string> {
  try {
    const prompt = `
      Enhance this job posting to be more engaging and comprehensive while maintaining the original intent:
      
      Title: ${title}
      Description: ${description}
      Skills: ${skills.join(", ")}
      Category: ${category}
      
      Improve the description by:
      - Making it more engaging and professional
      - Adding clear requirements and expectations
      - Including project scope and deliverables
      - Maintaining the original tone and requirements
      
      Return only the enhanced description text, no additional formatting.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert job posting writer. Enhance job descriptions to attract top talent while being clear and professional."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || description;
  } catch (error) {
    console.error("Job enhancement error:", error);
    return description;
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  freelancerSkills: string[],
  freelancerExperience: string
): Promise<string> {
  try {
    const prompt = `
      Generate a professional cover letter for this job application:
      
      Job: ${jobTitle}
      Description: ${jobDescription}
      Applicant Skills: ${freelancerSkills.join(", ")}
      Applicant Experience: ${freelancerExperience}
      
      Write a compelling, personalized cover letter that:
      - Highlights relevant skills and experience
      - Shows understanding of the project requirements
      - Demonstrates enthusiasm and professionalism
      - Keeps it concise (2-3 paragraphs)
      
      Return only the cover letter text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional freelancer writing expert. Create compelling cover letters that win jobs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || "I am interested in this position and believe my skills align well with your requirements.";
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return "I am interested in this position and believe my skills align well with your requirements.";
  }
}
