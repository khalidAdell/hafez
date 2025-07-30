import React from 'react';

const Services = ({ services }) => {
  if (!services || services.length === 0) return null;

  return (
    <div id="features">
      <section className="my-20">
        <div className="container mx-auto px-5 flex flex-wrap">
          <div className="grid md:grid-cols-3 grid-cols-1 md:gap-8 gap-5 w-full">
            {services.map((service) => (
              <div key={service.id} className="feature-item group">
                <div className="border border-gray-200 p-4 rounded-lg flex justify-center items-center flex-col gap-4 h-[250px] group-hover:bg-[#0B7459] group-hover:text-white duration-300 transform">
                  <h2 className="text-xl font-bold text-black group-hover:text-white">
                    {service.name}
                  </h2>
                  <p className="text-base text-gray-600 group-hover:text-white">
                    {service.content.length > 200
                      ? service.content.slice(0, 200) + "..."
                      : service.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
