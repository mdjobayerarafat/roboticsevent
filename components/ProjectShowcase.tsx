import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  delay: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, image, tags, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20"></div>
        
        {/* Placeholder for robot/project image */}
        <div className="flex items-center justify-center h-full">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="text-4xl">🤖</div>
          </div>
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-4">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-gray-900 ml-1" />
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Learn More Link */}
        <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors cursor-pointer">
          Learn More
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

const ProjectShowcase: React.FC = () => {
  const projects = [
    {
      title: 'Autonomous Navigation Robot',
      description: 'Advanced robot capable of mapping environments and navigating obstacles using LiDAR and computer vision.',
      image: '/robot1.jpg',
      tags: ['AI', 'Computer Vision', 'LiDAR', 'ROS']
    },
    {
      title: 'Collaborative Robotic Arm',
      description: 'Six-axis robotic arm designed for safe human-robot collaboration in manufacturing environments.',
      image: '/robot2.jpg',
      tags: ['Collaborative', 'Industrial', 'Safety', 'Precision']
    },
    {
      title: 'Swarm Intelligence Drones',
      description: 'Multiple autonomous drones working together to complete complex tasks using swarm intelligence.',
      image: '/robot3.jpg',
      tags: ['Swarm', 'Drones', 'Coordination', 'Wireless']
    }
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12 bg-gray-400"></div>
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">SHOWCASE</span>
            <div className="h-px w-12 bg-gray-400"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Featured
            <br />
            <span className="gradient-text">Robot Projects</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore cutting-edge robotics projects developed by our community of innovators and researchers.
          </p>
        </motion.div>
        
        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              image={project.image}
              tags={project.tags}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer group shadow-lg hover:shadow-xl">
            View All Projects
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectShowcase;
