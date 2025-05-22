import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { BoltIcon, HandRaisedIcon } from '@heroicons/react/24/solid';

const TradingModeToggle = ({ value = 'MANUAL', onChange }) => {
  const isAuto = value === 'AUTO';
  
  const handleChange = () => {
    const newMode = isAuto ? 'MANUAL' : 'AUTO';
    onChange(newMode);
  };
  
  return (
    <div className="flex items-center bg-gray-800 p-2 rounded-lg border border-gray-700">
      <Switch
        checked={isAuto}
        onChange={handleChange}
        className={`${
          isAuto ? 'bg-blue-600' : 'bg-gray-600'
        } relative inline-flex h-6 w-11 items-center rounded-full`}
      >
        <span className="sr-only">Toggle trading mode</span>
        <span
          className={`${
            isAuto ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
      
      <div className="ml-3 flex items-center">
        {isAuto ? (
          <>
            <BoltIcon className="h-5 w-5 text-blue-500 mr-1.5" />
            <span className="text-blue-500 font-medium">AUTO</span>
          </>
        ) : (
          <>
            <HandRaisedIcon className="h-5 w-5 text-gray-400 mr-1.5" />
            <span className="text-gray-400 font-medium">MANUAL</span>
          </>
        )}
      </div>
    </div>
  );
};

export default TradingModeToggle;